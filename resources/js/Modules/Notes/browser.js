import { createNotesStore, createRouter, validateText } from '../../../../packages/zefram-js/src/index.js';

export function createBrowserNotes({ storage, key = 'zefram.modules.notes.notes' }) {
    const store = createNotesStore({ storage, key });
    const router = createRouter().post('/notes', async (request) => {
        const { title } = await request.json();
        const validation = validateText(title, { label: 'Title', maxLength: 200 });

        if (validation.error) {
            return Response.json({ error: validation.error }, { status: 422 });
        }

        store.add(validation.value);
        return Response.json({ notes: store.all(), error: null }, { status: 201 });
    });

    return {
        all: store.all,
        async save(title) {
            const response = await router.handle(new Request('https://zefram.local/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            }));

            return response.json();
        },
    };
}
