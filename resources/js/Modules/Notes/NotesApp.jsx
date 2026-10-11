import React, { useState } from 'react';
import { Button, Card, Input } from '../../Components/Slipstream.jsx';

export default function NotesApp({ notes, onSave, error, appName = 'My notes' }) {
    const [title, setTitle] = useState('');

    function saveNote(event) {
        event.preventDefault();
        onSave(title);
    }

    return (
        <div className="mx-auto max-w-lg">
            <h1 className="text-3xl font-semibold tracking-tight text-ink">{appName}</h1>
            <p className="mb-6 mt-3 text-sm leading-6 text-muted">A place to keep ideas you want to build.</p>
            <Card>
                <form onSubmit={saveNote}>
                    <label htmlFor="note-title" className="mb-2 block text-sm text-ink">Your idea</label>
                    <Input id="note-title" value={title} onChange={(event) => setTitle(event.target.value)}
                        placeholder="My first idea" aria-describedby={error ? 'note-error' : undefined}
                        aria-invalid={Boolean(error)} />
                    {error && <p id="note-error" role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
                    <Button type="submit" className="mt-4 w-full">Save note</Button>
                </form>
            </Card>
            <p className="mt-6 text-sm text-muted">Saved notes: {notes.length}</p>
            <div className="mt-3 space-y-3" aria-live="polite">
                {notes.map((note) => (
                    <Card key={note.id} className="p-4">
                        <p className="text-sm text-ink">{note.title}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}
