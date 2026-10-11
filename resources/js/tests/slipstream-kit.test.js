import assert from 'node:assert/strict';
import test from 'node:test';
import { createKitPlan, docsUrl } from '../slipstream-kit.js';

test('a JS kit plan uses browser storage and an additive provider entry', () => {
    const plan = createKitPlan('Ideas', 'js');

    assert.equal(plan.error, null);
    assert.equal(plan.command, 'php artisan slipstream:kit notes Ideas --edition=js');
    assert.equal(plan.providerLine, 'App\\Modules\\Ideas\\IdeasServiceProvider::class,');
    assert.equal(plan.componentPath, 'resources/js/Modules/Ideas/NotesApp.jsx');
    assert.equal(plan.visitPath, '/ideas');
    assert.equal(plan.migrationCommand, null);
    assert.equal(plan.buildCommand, 'npm run build');
    assert.ok(plan.files.includes('resources/js/Modules/Ideas/browser.js'));
    assert.equal(plan.files.some((file) => file.includes('Database/')), false);
});

test('a PHP kit plan includes the database files and migration before building', () => {
    const plan = createKitPlan('Journal', 'php');

    assert.equal(plan.command, 'php artisan slipstream:kit notes Journal --edition=php');
    assert.equal(plan.migrationCommand, 'php artisan migrate');
    assert.equal(plan.visitPath, '/journal');
    assert.ok(plan.files.includes('app/Modules/Journal/Models/Note.php'));
    assert.ok(plan.files.includes('app/Modules/Journal/Http/Requests/StoreNoteRequest.php'));
    assert.ok(plan.files.includes('app/Modules/Journal/Database/Migrations/{timestamp}_create_journal_notes_table.php'));
    assert.equal(plan.files.some((file) => file.endsWith('/browser.js')), false);
});

test('module route slugs match Laravel kebab case for capitals and numbers', () => {
    const examples = [
        ['MyIdeas', 'my-ideas'],
        ['API', 'a-p-i'],
        ['APIKeys', 'a-p-i-keys'],
        ['Ideas2Go', 'ideas2-go'],
        ['A', 'a'],
    ];

    for (const [name, slug] of examples) {
        assert.equal(createKitPlan(name).slug, slug);
    }
});

test('invalid names and the existing Notes module produce no runnable command', () => {
    const invalid = ['', 'ideas', ' MyIdeas ', 'Ideas-List', 'Ideas_List', '1Ideas', 'Idées', '../Ideas', 'Ideas;echo hi', 'Ideas"$(id)', 'Ideas\n', 'Ideas\r', 'Ideas\r\n', 'Ideas\u2028', null, {}, 'Notes', 'NOTES'];

    for (const name of invalid) {
        const plan = createKitPlan(name, 'js');

        assert.equal(typeof plan.error, 'string', String(name));
        assert.equal(plan.command, undefined, String(name));
        assert.equal(plan.providerLine, undefined, String(name));
    }
});

test('an unsupported edition produces no runnable command', () => {
    const plan = createKitPlan('Ideas', 'python');

    assert.equal(plan.error, 'Choose the JS or PHP edition.');
    assert.equal(plan.command, undefined);
});

test('docs links preserve a module name and edition across Laravel and standalone pages', () => {
    assert.equal(docsUrl('slipstream-kits', { name: 'MyIdeas', edition: 'php' }), '/docs/slipstream-kits?edition=php&name=MyIdeas');
    assert.equal(docsUrl('modules', { name: 'MyIdeas', edition: 'js', standalone: true }), '?docs=modules&edition=js&name=MyIdeas');
    assert.equal(docsUrl('unknown', { edition: 'python' }), '/docs/getting-started?edition=js&name=Ideas');
});

test('a name in a docs link is encoded as query text instead of changing the destination', () => {
    const link = docsUrl('slipstream-kits', { name: 'Ideas&docs=evil#fragment' });

    assert.equal(link, '/docs/slipstream-kits?edition=js&name=Ideas%26docs%3Devil%23fragment');
});
