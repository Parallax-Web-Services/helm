import assert from 'node:assert/strict';
import test from 'node:test';
import { createBrowserNotes } from '../browser.js';

function memoryStorage() {
    const values = new Map();
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
    };
}

test('a module save returns trimmed notes that another consumer can read', async () => {
    const storage = memoryStorage();
    const module = createBrowserNotes({ storage, key: 'shared' });
    const result = await module.save('  My first idea  ');
    assert.equal(result.error, null);
    assert.equal(result.notes[0].title, 'My first idea');
    assert.deepEqual(createBrowserNotes({ storage, key: 'shared' }).all(), result.notes);
    assert.deepEqual(createBrowserNotes({ storage, key: 'other' }).all(), []);
});

test('invalid module input returns a field error without storing a note', async () => {
    const module = createBrowserNotes({ storage: memoryStorage() });
    assert.deepEqual(await module.save(' '), { error: 'Title is required.' });
    assert.deepEqual(await module.save('a'.repeat(201)), { error: 'Title must be 200 characters or fewer.' });
    assert.deepEqual(await module.save({ title: 'Wrong shape' }), { error: 'Title is required.' });
    assert.deepEqual(module.all(), []);
});

test('a module save surfaces storage failure so the caller can report it', async () => {
    const storage = memoryStorage();
    storage.setItem = () => { throw new Error('Storage is full.'); };
    const module = createBrowserNotes({ storage });
    await assert.rejects(module.save('Keep this idea'), /Storage is full/);
    assert.deepEqual(module.all(), []);
});
