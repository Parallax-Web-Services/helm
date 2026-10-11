import assert from 'node:assert/strict';
import test from 'node:test';
import { createNotesStore, createRouter, validateText } from '../src/index.js';

function memoryStorage() {
    const values = new Map();

    return {
        getItem(key) {
            return values.get(key) ?? null;
        },
        setItem(key, value) {
            values.set(key, value);
        },
    };
}

test('dispatches an async route with the original request and normalizes URL paths', async () => {
    const router = createRouter().post('/notes/', async (request) => {
        const { title } = await request.json();

        return Response.json({ title }, { status: 201 });
    });
    const request = new Request('https://zefram.local/notes?preview=1', {
        method: 'POST',
        body: JSON.stringify({ title: 'First signal' }),
    });

    const response = await router.handle(request);

    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { title: 'First signal' });
});

test('returns 404 for an unknown path', async () => {
    const router = createRouter().get('/notes', () => Response.json([]));

    const response = await router.handle(new Request('https://zefram.local/missing'));

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { message: 'Not found.' });
});

test('returns 405 and available methods for a known path with the wrong method', async () => {
    const router = createRouter()
        .get('/notes', () => Response.json([]))
        .post('/notes', () => Response.json({}));

    const response = await router.handle(new Request('https://zefram.local/notes', { method: 'DELETE' }));

    assert.equal(response.status, 405);
    assert.equal(response.headers.get('Allow'), 'GET, POST');
});

test('surfaces route handler failures and rejects a response without the Response contract', async () => {
    const router = createRouter()
        .get('/broken', () => { throw new Error('Fix the route.'); })
        .get('/invalid', () => ({ title: 'Missing Response.json' }));

    await assert.rejects(router.handle(new Request('https://zefram.local/broken')), /Fix the route\./);
    await assert.rejects(router.handle(new Request('https://zefram.local/invalid')), /Route handlers must return a Response\./);
    assert.throws(() => createRouter().get('/invalid', null), /Route handlers must be functions\./);
});

test('trims valid text and returns the field message for missing or oversized text', () => {
    assert.deepEqual(validateText('  First signal  '), { value: 'First signal', error: null });
    assert.deepEqual(validateText('   ', { label: 'Title' }), { value: '', error: 'Title is required.' });
    assert.deepEqual(validateText({ title: 'Signal' }, { label: 'Title' }), { value: '', error: 'Title is required.' });
    assert.deepEqual(validateText('Signal', { label: 'Title', maxLength: 5 }), {
        value: 'Signal', error: 'Title must be 5 characters or fewer.',
    });
    assert.equal(validateText('a'.repeat(200)).error, null);
    assert.equal(validateText('a'.repeat(201)).error, 'Text must be 200 characters or fewer.');
    assert.deepEqual([
        validateText('\u{1F680}'.repeat(200)).error,
        validateText('\u{1F680}'.repeat(201)).error,
    ], [null, 'Text must be 200 characters or fewer.']);
});

test('keeps notes across store recreation and isolates their storage key', (context) => {
    const storage = memoryStorage();
    const store = createNotesStore({ storage, key: 'voyage' });
    context.mock.method(globalThis.crypto, 'randomUUID', () => 'fixed-note-id');
    context.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-11T12:00:00Z').getTime() });

    const note = store.add('  First signal  ');

    assert.deepEqual(note, {
        id: 'fixed-note-id', title: 'First signal', createdAt: '2026-10-11T12:00:00.000Z',
    });
    assert.deepEqual(createNotesStore({ storage, key: 'voyage' }).all(), [note]);
    assert.deepEqual(createNotesStore({ storage, key: 'other' }).all(), []);
});

test('does not persist an invalid note and surfaces unavailable storage', () => {
    const storage = memoryStorage();
    const store = createNotesStore({ storage });

    assert.throws(() => store.add('  '), /Title is required\./);
    assert.throws(() => store.add('a'.repeat(201)), /Title must be 200 characters or fewer\./);
    assert.deepEqual(store.all(), []);
    assert.equal(storage.getItem('zefram.notes'), null);

    storage.setItem = () => { throw new Error('Storage quota exceeded.'); };

    assert.throws(() => store.add('First signal'), /Storage quota exceeded\./);
    assert.throws(() => createNotesStore({ storage: {} }), /A Storage-compatible adapter is required\./);
});

test('recovers from corrupt storage and omits invalid persisted records', () => {
    const storage = memoryStorage();
    const store = createNotesStore({ storage });
    const note = { id: 'existing', title: 'A kept signal', createdAt: '2026-10-11T12:00:00.000Z' };
    storage.setItem('zefram.notes', 'broken JSON');

    assert.deepEqual(store.all(), []);

    storage.setItem('zefram.notes', JSON.stringify({ notes: [] }));
    assert.deepEqual(store.all(), []);

    storage.setItem('zefram.notes', JSON.stringify([null, { title: 'Missing fields' }, note]));
    assert.deepEqual(store.all(), [note]);
});
