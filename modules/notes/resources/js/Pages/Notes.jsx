import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import NotesApp from '../NotesApp.jsx';
import { createBrowserNotes } from '../browser.js';
import HelmLayout from '../../../../../resources/js/Layouts/HelmLayout.jsx';

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
        <HelmLayout title="Notes" heading={false} width="4xl">
            <div className="mx-auto mb-8 flex max-w-lg flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-widest text-brand-light">Notes module</p>
                <div className="flex gap-1 rounded-lg border border-brand-border/50 bg-surface p-1" role="group" aria-label="Notes edition">
                    {['js', 'php'].map((option) => (
                        <button key={option} type="button" aria-pressed={edition === option}
                            onClick={() => router.get('/notes', { edition: option }, { preserveState: true, preserveScroll: true })}
                            className={`rounded-md px-3 py-2 text-sm focus-ring ${edition === option ? 'bg-[image:var(--brand-gradient)] text-white' : 'text-muted hover:text-ink'}`}>
                            {option === 'js' ? 'JS · Browser' : 'PHP · Laravel'}
                        </button>
                    ))}
                </div>
            </div>
            <NotesApp notes={edition === 'php' ? notes : browserNotes} onSave={save} error={error} />
            <p className="mx-auto mt-6 max-w-lg text-xs text-muted">
                {edition === 'php' ? 'Saved in SQLite for this browser session.' : 'Saved in this browser.'}
            </p>
        </HelmLayout>
    );
}
