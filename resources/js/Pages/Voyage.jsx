import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { createBrowserNotes } from '../Modules/Notes/browser.js';
import { Button, Input } from '../Components/Slipstream.jsx';
import { createKitPlan, docsUrl } from '../slipstream-kit.js';
import kitSource from '../Components/Slipstream.jsx?raw';
import zeframLockup from '../../images/zefram-lockup.png';
import { missions, starterSource, tourVersion } from '../voyage-sample.js';

function Icon({ name, className = 'h-4 w-4' }) {
    const paths = {
        check: <path d="m5 12 4 4L19 6" />,
        code: <path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 22" />,
        preview: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8m-4-4v4" /></>,
        download: <path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4" />,
        reset: <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" /></>,
        find: <><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></>,
    };
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">{paths[name]}</svg>;
}

function readVoyage(edition) {
    try {
        const saved = JSON.parse(localStorage.getItem(`zefram.voyage.${edition}`) || 'null');
        const hasDraft = typeof saved?.source === 'string';
        const version = hasDraft ? (Number.isInteger(saved.tourVersion) ? saved.tourVersion : 1) : tourVersion;
        return {
            edition,
            tourVersion: version,
            source: hasDraft ? saved.source : starterSource,
            completed: version === tourVersion && Array.isArray(saved?.completed)
                ? [...new Set(saved.completed.filter((id) => missions.some((mission) => mission.id === id)))]
                : [],
        };
    } catch {
        return { edition, tourVersion, source: starterSource, completed: [] };
    }
}

function createBrowserService() {
    try {
        const service = createBrowserNotes({ storage: window.localStorage, key: 'zefram.voyage.notes' });
        return { save: service.save, notes: service.all(), error: null };
    } catch {
        return { save: null, notes: [], error: 'Your browser could not open local storage. Allow site storage to save notes.' };
    }
}

export default function Voyage({ edition = 'js', notes = [], standalone = false }) {
    const [voyage, setVoyage] = useState(() => readVoyage(edition));
    const [moduleName, setModuleName] = useState('Ideas');
    const [browserService] = useState(createBrowserService);
    const [browserNotes, setBrowserNotes] = useState(browserService.notes);
    const [activeMission, setActiveMission] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [findStatus, setFindStatus] = useState(null);
    const [previewReady, setPreviewReady] = useState(false);
    const [previewState, setPreviewState] = useState('Starting preview');
    const [previewError, setPreviewError] = useState(null);
    const [formError, setFormError] = useState(null);
    const [draftError, setDraftError] = useState(null);
    const [isSwitchingEdition, setIsSwitchingEdition] = useState(false);
    const [previewStyles] = useState(() => Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map((node) => node.tagName === 'LINK' ? `<link rel="stylesheet" href="${node.href}">` : node.outerHTML).join(''));
    const iframeRef = useRef(null);
    const editorRef = useRef(null);
    const lineNumbersRef = useRef(null);
    const contextRef = useRef(null);
    const lastSourceSentRef = useRef(null);
    const pendingSaveRef = useRef(null);
    const currentNotes = edition === 'php' ? notes : browserNotes;
    const currentMission = missions[activeMission];
    const completedCount = voyage.completed.length;
    const isRevisedTour = voyage.tourVersion === tourVersion;
    const kitPlan = createKitPlan(moduleName, edition);
    contextRef.current = { edition, source: voyage.source, notes: currentNotes, error: formError };

    const sendToPreview = useCallback((message) => {
        iframeRef.current?.contentWindow?.postMessage(message, '*');
    }, []);

    const sendSourceToPreview = useCallback(() => {
        lastSourceSentRef.current = { edition: contextRef.current.edition, source: contextRef.current.source };
        sendToPreview({ type: 'voyage:source', ...contextRef.current });
    }, [sendToPreview]);

    const completeMission = useCallback((id) => {
        setVoyage((current) => current.edition === edition && current.tourVersion === tourVersion && !current.completed.includes(id)
            ? { ...current, completed: [...current.completed, id] }
            : current);
    }, [edition]);

    useEffect(() => {
        if (voyage.edition !== edition) {
            setVoyage(readVoyage(edition));
            setPreviewReady(false);
            setPreviewState('Starting preview');
            setPreviewError(null);
            setFormError(null);
            setActiveMission(0);
            setShowHint(false);
            setFindStatus(null);
            pendingSaveRef.current = null;
        }
    }, [edition, voyage.edition]);

    useEffect(() => {
        if (voyage.edition !== edition) return;
        try {
            localStorage.setItem(`zefram.voyage.${edition}`, JSON.stringify(voyage));
            setDraftError(null);
        } catch {
            setDraftError('Browser storage is unavailable. Download your draft to keep it.');
        }
    }, [edition, voyage]);

    useEffect(() => {
        if (!previewReady || voyage.edition !== edition) return;
        if (lastSourceSentRef.current?.edition === edition && lastSourceSentRef.current.source === voyage.source) return;
        setPreviewState('Updating preview');
        const timeout = setTimeout(sendSourceToPreview, 250);
        return () => clearTimeout(timeout);
    }, [edition, voyage.edition, voyage.source, previewReady, sendSourceToPreview]);

    useEffect(() => {
        if (previewReady) sendToPreview({ type: 'voyage:notes', notes: currentNotes, error: formError });
    }, [currentNotes, formError, previewReady, sendToPreview]);

    useEffect(() => {
        const receiveMessage = async (event) => {
            if (event.source !== iframeRef.current?.contentWindow || !event.data || typeof event.data !== 'object') return;
            const message = event.data;
            if (message.type === 'voyage:ready') {
                setPreviewReady(true);
                setPreviewState('Updating preview');
                sendSourceToPreview();
            } else if (message.type === 'voyage:error') {
                setPreviewState('Check your code');
                setPreviewError(String(message.message || 'Your preview could not render.'));
            } else if (message.type === 'voyage:rendered') {
                setPreviewState('Preview is live');
                setPreviewError(null);
                if (typeof message.title === 'string' && message.title.trim() && message.title.trim() !== 'My notes') completeMission('name');
                const pendingSave = pendingSaveRef.current;
                if (pendingSave?.edition === edition && Number.isInteger(message.savedCount) && message.savedCount >= pendingSave.expectedCount) {
                    completeMission('save');
                    pendingSaveRef.current = null;
                }
                const persistedNotes = pendingSave?.edition === edition ? pendingSave.notes : contextRef.current.notes;
                const visibleIds = Array.isArray(message.visibleNoteIds) ? message.visibleNoteIds.map(String) : [];
                if (persistedNotes.some((note) => visibleIds.includes(String(note.id)))) completeMission('render');
            } else if (message.type === 'voyage:note') {
                const previousCount = contextRef.current.notes.length;
                if (edition === 'js') {
                    if (!browserService.save) {
                        setFormError(browserService.error);
                        return;
                    }
                    try {
                        const result = await browserService.save(message.title);
                        if (result.error) {
                            setFormError(result.error);
                        } else if (result.notes) {
                            if (result.notes.length > previousCount) pendingSaveRef.current = { edition, expectedCount: result.notes.length, notes: result.notes };
                            setBrowserNotes(result.notes);
                            setFormError(null);
                        }
                    } catch {
                        setFormError('Your browser could not save this note. Allow site storage and try again.');
                    }
                } else {
                    router.post('/voyage/notes', { title: message.title }, {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: (page) => {
                            if (contextRef.current.edition !== edition) return;
                            const savedNotes = page.props.notes || [];
                            if (savedNotes.length > previousCount) pendingSaveRef.current = { edition, expectedCount: savedNotes.length, notes: savedNotes };
                            setFormError(null);
                            sendToPreview({ type: 'voyage:notes', notes: savedNotes, error: null });
                        },
                        onError: (errors) => {
                            if (contextRef.current.edition !== edition) return;
                            const error = errors.title || 'Your note could not be saved.';
                            setFormError(error);
                            sendToPreview({ type: 'voyage:notes', notes: contextRef.current.notes, error });
                        },
                    });
                }
            }
        };
        window.addEventListener('message', receiveMessage);
        return () => window.removeEventListener('message', receiveMessage);
    }, [browserService, completeMission, edition, sendSourceToPreview, sendToPreview]);

    const switchEdition = (nextEdition) => {
        if (nextEdition === edition || isSwitchingEdition || standalone) return;
        setIsSwitchingEdition(true);
        router.get('/', { edition: nextEdition }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsSwitchingEdition(false),
        });
    };

    const resetSource = () => {
        setVoyage({ edition, tourVersion, source: starterSource, completed: [] });
        setActiveMission(0);
        setShowHint(false);
        setFindStatus(null);
        setFormError(null);
        pendingSaveRef.current = null;
    };

    const downloadSource = () => {
        const helpers = kitSource.replace(/^import React from 'react';\r?\n/m, '').replace(/^export /gm, '');
        const downloadableSource = `import React from 'react';\n\n// The parent supplies notes, onSave, and error. Style with Tailwind.\n${helpers}\nconst Slipstream = { Button, Input, Card };\n\n${voyage.source}\n\nexport default App;\n`;
        const blob = new Blob([downloadableSource], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'App.jsx';
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const findMissionCode = () => {
        const start = voyage.source.indexOf(currentMission.find);
        if (start === -1) {
            setFindStatus('That starting code is no longer in your draft. You may have changed it already; compare your code with the replacement below.');
            return;
        }
        const editor = editorRef.current;
        const line = voyage.source.slice(0, start).split('\n').length - 1;
        editor.focus();
        editor.setSelectionRange(start, start + currentMission.find.length);
        editor.scrollTop = Math.max(0, line * 24 - 48);
        if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = editor.scrollTop;
        editor.scrollIntoView({ block: 'center' });
        setFindStatus('Starting code selected in App.jsx. Replace it with the example below, or write your own version.');
    };

    const previewScript = standalone ? new URL('preview/preview.js', window.location.href).href : `${window.location.origin}/preview/preview.js`;
    const previewDocument = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your notes app preview</title>${previewStyles}<style>html,body{margin:0;background:#11101a;color:#f5f3fa;font-family:system-ui,sans-serif}body{min-height:100vh}</style></head><body><div id="root"></div><script src="${previewScript}"></script></body></html>`;

    return (
        <>
            {!standalone && <Head title="Maiden Voyage" />}
            <div className="min-h-screen bg-[#090810] text-ink">
                <header className="border-b border-brand-border/40 bg-surface/70">
                    <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-5 px-5 py-5 sm:px-8 lg:px-10">
                        <a href={standalone ? window.location.pathname : '/'} aria-label="Zefram home"><img src={zeframLockup} alt="Zefram" className="h-auto w-[175px] sm:w-[205px]" /></a>
                        <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-5"><a href={docsUrl('getting-started', { edition, name: moduleName, standalone })} className="rounded text-sm text-brand-light hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-light">Docs</a>{!standalone && <a href={`/notes?edition=${edition}`} className="text-sm text-brand-light hover:text-ink">Notes module</a>}<span className="hidden text-sm font-medium tracking-wide text-muted sm:block">Maiden Voyage</span></div>
                    </div>
                </header>
                <main className="mx-auto max-w-[1680px] px-5 pb-10 pt-8 sm:px-8 lg:px-10">
                    <div className="mb-7 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div>
                            <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-brand-light">A guided introduction to Zefram</p>
                            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Build a notes app.</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Name your app, connect a form, and show saved notes. Change the code, then check the result in your live preview.</p>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Input state, validation, and storage are provided. You connect the form and render the saved list.</p>
                        </div>
                        <div className="shrink-0">
                            <p className="mb-2 text-xs text-muted">Choose your edition</p>
                            <div className="inline-flex gap-1 rounded-lg border border-brand-border/50 bg-surface p-1" role="group" aria-label="Zefram edition">
                                {['js', 'php'].map((option) => <button key={option} type="button" aria-pressed={edition === option} disabled={isSwitchingEdition || (standalone && option === 'php')} onClick={() => switchEdition(option)} className={`rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-brand-light disabled:opacity-50 ${edition === option ? 'bg-[image:var(--brand-gradient)] text-white' : 'text-muted hover:text-ink'}`}>{option === 'js' ? 'JS · Browser' : 'PHP · Laravel'}</button>)}
                            </div>
                            {standalone && <p className="mt-2 text-xs text-muted">PHP edition runs with Laravel.</p>}
                        </div>
                    </div>

                    {!isRevisedTour && <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-brand-border bg-brand/5 px-5 py-4"><div><p className="text-sm font-semibold text-ink">Your existing draft is preserved.</p><p className="mt-1 text-sm leading-6 text-muted">This draft uses an earlier tour. Keep editing it, or start the revised notes app tour. Your saved notes stay.</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={downloadSource}>Download draft</Button><Button onClick={resetSource}>Start revised tour</Button></div></div>}

                    <nav className="mb-5 grid gap-3 md:grid-cols-3" aria-label="Notes app steps">
                        {missions.map((mission, index) => {
                            const isComplete = voyage.completed.includes(mission.id);
                            const isActive = index === activeMission;
                            return <button key={mission.id} type="button" onClick={() => { setActiveMission(index); setShowHint(false); setFindStatus(null); }} aria-pressed={isActive} className={`flex items-start gap-3 rounded-lg border px-4 py-4 text-left transition focus-visible:outline-2 focus-visible:outline-brand-light ${isActive ? 'border-brand bg-brand/10' : 'border-brand-border/40 bg-surface hover:border-brand-border'}`}><span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${isComplete ? 'bg-brand/20 text-brand-light' : isActive ? 'bg-[image:var(--brand-gradient)] text-white' : 'bg-surface-raised text-muted'}`}>{isComplete ? <Icon name="check" /> : index + 1}</span><span><span className="block text-sm font-semibold text-ink">{mission.title}</span><span className="mt-1 block text-xs leading-5 text-muted">{isComplete ? 'Complete · ' : ''}{mission.description}</span></span></button>;
                        })}
                    </nav>

                    <section className="overflow-hidden rounded-lg border border-brand-border/55 bg-surface" aria-label="Guided live development workspace">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border/40 bg-surface-raised px-5 py-3.5"><div className="flex items-center gap-2 text-sm font-medium text-ink"><Icon name="code" className="h-4 w-4 text-brand-light" />Your notes app<span className="hidden text-xs font-normal text-muted sm:inline">React + Slipstream</span></div><div className="flex flex-wrap gap-4"><button type="button" onClick={resetSource} disabled={isRevisedTour && voyage.source === starterSource && completedCount === 0} className="flex items-center gap-1.5 rounded text-xs text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-light disabled:opacity-40"><Icon name="reset" />Reset starter</button><button type="button" onClick={downloadSource} className="flex items-center gap-1.5 rounded text-xs text-muted hover:text-brand-light focus-visible:outline-2 focus-visible:outline-brand-light"><Icon name="download" />Download draft</button></div></div>
                        <div className="grid xl:grid-cols-[300px_minmax(0,1fr)]">
                            <aside className="border-b border-brand-border/40 bg-surface-raised p-5 xl:border-b-0 xl:border-r" aria-label={`Step ${activeMission + 1} guide`}>
                                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-light">Step {activeMission + 1} of 3</p>
                                <h2 className="mb-6 text-lg font-semibold leading-6 text-ink">{currentMission.title}</h2>
                                <div className="space-y-5">
                                    <div><h3 className="mb-2 text-sm font-semibold text-ink">Change</h3><p className="mb-2 text-sm leading-6 text-muted">Find this code in App.jsx:</p><pre className="overflow-x-auto rounded-md border border-brand-border/35 bg-[#0c0b12] p-3 font-mono text-xs leading-5 text-brand-light"><code>{currentMission.find}</code></pre><Button variant="secondary" onClick={findMissionCode} className="mt-3 w-full text-sm"><Icon name="find" />Find this code</Button><p className="mb-2 mt-4 text-sm leading-6 text-muted">Replace it with:</p><pre className="overflow-x-auto rounded-md border border-brand-border/35 bg-[#0c0b12] p-3 font-mono text-xs leading-5 text-ink"><code>{currentMission.replacement}</code></pre>{findStatus && <p role="status" className="mt-3 text-sm leading-6 text-brand-light">{findStatus}</p>}</div>
                                    <div><h3 className="mb-2 text-sm font-semibold text-ink">Why</h3><p className="text-sm leading-6 text-muted">{currentMission.why}</p></div>
                                    <div><h3 className="mb-2 text-sm font-semibold text-ink">Check</h3><p className="text-sm leading-6 text-muted">{currentMission.check}</p></div>
                                    <div><button type="button" onClick={() => setShowHint(!showHint)} aria-expanded={showHint} className="rounded text-sm text-brand-light underline decoration-brand-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-brand-light">{showHint ? 'Hide explanation' : 'More help'}</button>{showHint && <p className="mt-3 text-sm leading-6 text-muted">{currentMission.hint}</p>}</div>
                                </div>
                            </aside>
                            <div className="grid min-w-0 lg:grid-cols-2">
                                <div className="min-w-0 border-b border-brand-border/40 lg:border-b-0 lg:border-r">
                                    <div className="flex h-11 items-center justify-between border-b border-brand-border/30 px-4"><span className="font-mono text-xs text-ink">App.jsx</span><span className="text-xs text-muted">Edit here</span></div>
                                    <div className="relative h-[580px] bg-[#0c0b12] lg:h-[750px]">
                                        <div ref={lineNumbersRef} aria-hidden="true" className="absolute inset-y-0 left-0 w-12 overflow-hidden border-r border-brand-border/15 py-5 pr-3 text-right font-mono text-xs leading-6 text-dim">{voyage.source.split('\n').map((_, index) => <div key={index}>{index + 1}</div>)}</div>
                                        <textarea ref={editorRef} aria-label="App.jsx source code" value={voyage.source} onChange={(event) => setVoyage((current) => ({ ...current, source: event.target.value }))} onScroll={(event) => { if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = event.currentTarget.scrollTop; }} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" className="h-full w-full resize-none bg-transparent py-5 pl-16 pr-5 font-mono text-xs leading-6 text-ink outline-none selection:bg-brand/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50" />
                                    </div>
                                    <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-t border-brand-border/30 px-4 py-2 text-xs text-muted"><span>{draftError ? 'Local save unavailable' : 'Draft saved in this browser'}</span><span>JSX</span></div>
                                </div>
                                <div className="min-w-0 bg-surface">
                                    <div className="flex h-11 items-center justify-between border-b border-brand-border/30 px-4"><span className="flex items-center gap-2 text-xs text-ink"><Icon name="preview" />Live preview</span><span className={`flex items-center gap-1.5 text-xs ${previewError ? 'text-rose-300' : 'text-brand-light'}`}><span className={`h-1.5 w-1.5 rounded-full ${previewError ? 'bg-rose-300' : 'bg-brand'}`} />{previewError ? 'Needs a fix' : previewReady ? 'Connected' : 'Connecting'}</span></div>
                                    <iframe key={edition} ref={iframeRef} title="Live preview of your notes app" sandbox="allow-scripts allow-forms" srcDoc={previewDocument} className="h-[580px] w-full border-0 lg:h-[750px]" />
                                    <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-t border-brand-border/30 px-4 py-2 text-xs text-muted"><span role="status" aria-live="polite">{previewState}</span><span>{edition === 'js' ? 'Storage: this browser' : 'Storage: SQLite'}</span></div>
                                </div>
                            </div>
                        </div>
                        {(previewError || draftError) && <div role="alert" className="border-t border-rose-400/20 bg-rose-400/5 px-5 py-3 font-mono text-sm leading-6 text-rose-300">{previewError || draftError}</div>}
                    </section>
                    {completedCount === 3 && <section className="mt-5 rounded-lg border border-brand-border bg-brand/5 px-5 py-5" aria-label="Continue from Maiden Voyage">
                        <h2 className="text-xl font-semibold text-ink">Your notes app works.</h2>
                        <p className="mt-2 text-sm leading-6 text-muted">You named the page, connected Save, and displayed stored notes. Make it a module in your project next.</p>
                        <form onSubmit={(event) => event.preventDefault()} className="mt-5 flex flex-wrap items-end gap-3">
                            <div className="w-full sm:w-72">
                                <label htmlFor="voyage-module-name" className="mb-2 block text-sm font-semibold text-ink">Module name</label>
                                <Input id="voyage-module-name" value={moduleName} onChange={(event) => setModuleName(event.target.value)} placeholder="Ideas" autoComplete="off" spellCheck={false} aria-invalid={Boolean(kitPlan.error)} aria-describedby={kitPlan.error ? 'voyage-module-error' : undefined} />
                            </div>
                            {kitPlan.error
                                ? <Button disabled>Continue to kit setup</Button>
                                : <a href={docsUrl('slipstream-kits', { edition, name: moduleName, standalone })} className="inline-flex items-center justify-center rounded-md border border-brand-border bg-[image:var(--brand-gradient)] px-4 py-3 text-sm font-semibold text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-light">Continue to kit setup</a>}
                        </form>
                        {kitPlan.error && <p id="voyage-module-error" role="alert" className="mt-3 text-sm leading-6 text-rose-300">{kitPlan.error}</p>}
                        <p className="mt-4 text-sm leading-6 text-muted">The kit setup shows you how to scaffold, register, and run your module. To keep your edits, download App.jsx now and use it to replace the generated component before building. Your edits are not transferred automatically.</p>
                        <Button variant="secondary" onClick={downloadSource} className="mt-3">Download App.jsx</Button>
                        <p className="mt-3 text-sm text-muted">You can keep editing your app here, too.</p>
                    </section>}
                    <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted"><p>{completedCount} of 3 steps complete</p><p>Change the code. Understand the result.</p></footer>
                </main>
            </div>
        </>
    );
}
