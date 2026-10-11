const sections = new Set(['getting-started', 'modules', 'slipstream-kits']);

export function createKitPlan(name = 'Ideas', edition = 'js') {
    if (edition !== 'js' && edition !== 'php') {
        return { error: 'Choose the JS or PHP edition.' };
    }
    const validName = typeof name === 'string' && /^[A-Z]/.test(name) && !/[^A-Za-z0-9]/.test(name);
    if (!validName) {
        return { error: 'Use a PascalCase module name with letters and numbers, such as Ideas or MyIdeas.' };
    }
    if (name.toLowerCase() === 'notes') {
        return { error: 'Notes is already included. Choose a new module name, such as Ideas.' };
    }

    const slug = name.replace(/(.)(?=[A-Z])/g, '$1-').toLowerCase();
    const modulePath = `app/Modules/${name}`;
    const componentPath = `resources/js/Modules/${name}/NotesApp.jsx`;
    const files = [
        `${modulePath}/${name}ServiceProvider.php`,
        `${modulePath}/routes.php`,
        `resources/js/Pages/${name}.jsx`,
        componentPath,
    ];

    if (edition === 'js') {
        files.push(`resources/js/Modules/${name}/browser.js`);
    } else {
        files.push(
            `${modulePath}/Models/Note.php`,
            `${modulePath}/Notes.php`,
            `${modulePath}/Http/Requests/StoreNoteRequest.php`,
            `${modulePath}/Http/Controllers/NotesController.php`,
            `${modulePath}/Database/Migrations/{timestamp}_create_${slug.replaceAll('-', '_')}_notes_table.php`,
        );
    }

    return {
        error: null,
        name,
        edition,
        slug,
        command: `php artisan slipstream:kit notes ${name} --edition=${edition}`,
        providerLine: `App\\Modules\\${name}\\${name}ServiceProvider::class,`,
        componentPath,
        files,
        migrationCommand: edition === 'php' ? 'php artisan migrate' : null,
        buildCommand: 'npm run build',
        serveCommand: 'php artisan serve',
        visitPath: `/${slug}`,
    };
}

export function docsUrl(section = 'getting-started', { edition = 'js', name = 'Ideas', standalone = false } = {}) {
    const currentSection = sections.has(section) ? section : 'getting-started';
    const query = new URLSearchParams();
    if (standalone) query.set('docs', currentSection);
    query.set('edition', edition === 'php' ? 'php' : 'js');
    if (typeof name === 'string') query.set('name', name);
    return `${standalone ? '' : `/docs/${currentSection}`}?${query}`;
}
