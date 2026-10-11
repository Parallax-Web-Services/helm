import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import NotesApp from '../Modules/Notes/NotesApp.jsx';
import { createBrowserNotes } from '../Modules/Notes/browser.js';
import zeframLockup from '../../images/zefram-lockup.png';
import { docsUrl } from '../slipstream-kit.js';

function openBrowserNotes() {
    try {
        const service = createBrowserNotes({ storage: window.localStorage, key: 'zefram.voyage.notes' });
        return { service, notes: service.all(), error: null };
    } catch {
        return { service: null, notes: [], error: 'Browser storage is unavailable. Allow site storage to save notes.' };
    }
}

export default function Notes({ edition = 'js', notes = [] }) {
    const [browser] = useState(openBrowserNotes);
    const [browserNotes, setBrowserNotes] = useState(browser.notes);
    const [error, setError] = useState(edition === 'js' ? browser.error : null);

    useEffect(() => {
        setError(edition === 'js' ? browser.error : null);
    }, [edition, browser.error]);

    async function save(title) {
        if (edition === 'php') {
            router.post('/notes', { title }, {
                preserveScroll: true,
                onSuccess: () => setError(null),
                onError: (errors) => setError(errors.title || 'Your note could not be saved.'),
            });
            return;
        }

        if (!browser.service) {
            setError(browser.error);
            return;
        }

        try {
            const result = await browser.service.save(title);
            setError(result.error);
            if (result.notes) setBrowserNotes(result.notes);
        } catch {
            setError('Your browser could not save this note. Allow site storage and try again.');
        }
    }

    return (
        <>
            <Head title="Notes" />
            <div className="min-h-screen bg-[#090810] text-ink">
                <header className="border-b border-brand-border/40 bg-surface/70">
                    <div className="mx-auto flex max-w-5xl items-center justify-between gap-5 px-5 py-5">
                        <a href="/" aria-label="Zefram home"><img src={zeframLockup} alt="Zefram" className="h-auto w-[175px]" /></a>
                        <div className="flex items-center gap-5 text-sm text-brand-light"><a href={docsUrl('getting-started', { edition })} className="hover:text-ink">Docs</a><a href="/" aria-label="Maiden Voyage" className="hover:text-ink"><span className="sm:hidden">Tour</span><span className="hidden sm:inline">Maiden Voyage</span></a></div>
                    </div>
                </header>
                <main className="mx-auto max-w-5xl px-5 py-10">
                    <div className="mx-auto mb-8 flex max-w-lg flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-medium uppercase tracking-widest text-brand-light">Notes module</p>
                        <div className="flex gap-1 rounded-lg border border-brand-border/50 bg-surface p-1" role="group" aria-label="Notes edition">
                            {['js', 'php'].map((option) => (
                                <button key={option} type="button" aria-pressed={edition === option}
                                    onClick={() => router.get('/notes', { edition: option }, { preserveState: true, preserveScroll: true })}
                                    className={`rounded-md px-3 py-2 text-sm ${edition === option ? 'bg-[image:var(--brand-gradient)] text-white' : 'text-muted hover:text-ink'}`}>
                                    {option === 'js' ? 'JS · Browser' : 'PHP · Laravel'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <NotesApp notes={edition === 'php' ? notes : browserNotes} onSave={save} error={error} />
                    <p className="mx-auto mt-6 max-w-lg text-xs text-muted">
                        {edition === 'php' ? 'Saved in SQLite for this browser session.' : 'Saved in this browser.'}
                    </p>
                </main>
            </div>
        </>
    );
}
