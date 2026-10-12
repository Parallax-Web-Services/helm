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

    if (['app', 'database', 'tests'].includes(name.toLowerCase())) {
        return { error: 'That namespace is reserved. Choose a new module name, such as Ideas.' };
    }

    const slug = name.replace(/(.)(?=[A-Z])/g, '$1-').toLowerCase();
    const modulePath = `modules/${slug}`;
    const componentPath = `${modulePath}/resources/js/NotesApp.jsx`;
    const files = [
        `${modulePath}/src/Providers/${name}ServiceProvider.php`,
        `${modulePath}/routes/web.php`,
        `${modulePath}/resources/js/Pages/${name}.jsx`,
        componentPath,
    ];

    if (edition === 'js') {
        files.push(`${modulePath}/resources/js/browser.js`);
    } else {
        files.push(
            `${modulePath}/src/Models/Note.php`,
            `${modulePath}/src/Notes.php`,
            `${modulePath}/src/Http/Requests/StoreNoteRequest.php`,
            `${modulePath}/src/Http/Controllers/NotesController.php`,
            `${modulePath}/database/migrations/{timestamp}_create_${slug.replaceAll('-', '_')}_notes_table.php`,
        );
    }

    return {
        error: null,
        name,
        edition,
        slug,
        command: `php artisan slipstream:kit notes ${name} --edition=${edition}`,
        providerLine: `${name}\\Providers\\${name}ServiceProvider::class,`,
        autoloadLine: `"${name}\\\\": "${modulePath}/src/",`,
        autoloadCommand: 'composer dump-autoload',
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
