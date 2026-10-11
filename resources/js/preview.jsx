import React from 'react';
import { createRoot } from 'react-dom/client';
import { transform } from 'sucrase';
import * as Slipstream from './Components/Slipstream';

const root = createRoot(document.getElementById('root'));
let Component = null;
let generation = 0;
let notes = [];
let error = null;

function report(type, details = {}) {
    window.parent.postMessage({ type, ...details }, '*');
}

class PreviewBoundary extends React.Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error) {
        report('voyage:error', { message: error.message });
    }

    render() {
        if (this.state.error) {
            return <p role="alert" className="p-6 text-sm text-rose-300">
                {this.state.error.message}
            </p>;
        }

        return this.props.children;
    }
}

function Rendered() {
    React.useEffect(() => {
        const count = document.querySelector('[data-voyage-count]');
        const savedCount = count ? Number(count.dataset.voyageCount) : null;
        const visibleNoteIds = Array.from(
            document.querySelectorAll('[data-voyage-notes] [data-voyage-note]'),
        ).filter((element) => notes.some((note) => (
            String(note.id) === element.dataset.voyageNote
            && element.textContent.includes(note.title)
        ))).map((element) => element.dataset.voyageNote);

        report('voyage:rendered', {
            title: document.querySelector('h1')?.textContent.trim() ?? '',
            savedCount: Number.isFinite(savedCount) ? savedCount : null,
            visibleNoteIds,
        });
    }, [generation, notes, error]);

    return null;
}

function render() {
    if (!Component) {
        return;
    }

    root.render(
        <PreviewBoundary key={generation}>
            <Component
                notes={notes}
                error={error}
                onSave={(title) => report('voyage:note', { title })}
            />
            <Rendered />
        </PreviewBoundary>,
    );
}

window.addEventListener('message', (event) => {
    if (event.source !== window.parent) {
        return;
    }

    const message = event.data;

    if (message?.type === 'voyage:notes') {
        notes = Array.isArray(message.notes) ? message.notes : [];
        error = message.error ?? null;
        render();
        return;
    }

    if (message?.type !== 'voyage:source') {
        return;
    }

    try {
        const code = transform(message.source, {
            transforms: ['jsx'],
            jsxRuntime: 'classic',
            production: true,
            filePath: 'App.jsx',
        }).code;
        const nextComponent = new Function(
            'React',
            'Slipstream',
            `"use strict";\n${code}\nreturn typeof App === "function" ? App : null;`,
        )(React, Slipstream);

        if (!nextComponent) {
            throw new Error('Define function App({ notes, onSave, error }) to render your page.');
        }

        Component = nextComponent;
        generation += 1;
        notes = Array.isArray(message.notes) ? message.notes : [];
        error = message.error ?? null;
        render();
    } catch (error) {
        report('voyage:error', { message: error.message });
    }
});

window.addEventListener('error', (event) => {
    report('voyage:error', { message: event.message });
});

window.addEventListener('unhandledrejection', (event) => {
    report('voyage:error', { message: event.reason?.message ?? String(event.reason) });
});

report('voyage:ready');
