import React from 'react';
import { Head } from '@inertiajs/react';
import KitSetup, { CodeBlock } from '../Components/KitSetup.jsx';
import { docsUrl } from '../slipstream-kit.js';
import zeframLockup from '../../images/zefram-lockup.png';

const pages = [
    { id: 'getting-started', title: 'Getting started', description: 'Run Zefram and build your first app.' },
    { id: 'modules', title: 'Modules', description: 'Keep a feature together and reuse it.' },
    { id: 'slipstream-kits', title: 'Slipstream kits', description: 'Generate a module you can make your own.' },
];

function CodeExample({ label, children }) {
    return <CodeBlock label={label} code={children} />;
}

function SectionHeading({ id, children }) {
    return <h2 id={id} className="mb-3 mt-9 scroll-mt-6 text-xl font-semibold tracking-tight text-ink">{children}</h2>;
}

function GettingStarted({ edition, tourUrl, nextUrl }) {
    return (
        <>
            <p className="text-lg leading-8 text-muted">
                Start with a small Notes app. React and Tailwind handle the screen; choose where your notes live.
            </p>
            <p className="mt-4 leading-7 text-muted">
                Already running Zefram? <a className="text-brand-light underline underline-offset-4 hover:text-ink" href={tourUrl}>Start Maiden Voyage</a> and learn by changing real code.
            </p>
            <SectionHeading id="requirements">What you need</SectionHeading>
            <p className="leading-7 text-muted">
                {edition === 'js'
                    ? 'For the browser preview, use Node.js 24 with npm. The preview runs entirely in your browser and saves notes in browser storage.'
                    : 'For the PHP app, you need PHP 8.4 or later with the SQLite extension, Composer, and Node.js 24 with npm. Notes are saved in SQLite for your browser session.'}
            </p>
            <SectionHeading id="run">Run it</SectionHeading>
            <p className="leading-7 text-muted">Open a terminal in your Zefram checkout.</p>
            {edition === 'js' ? (
                <>
                    <CodeExample label="Terminal">{'npm install\nnpm run build\nnpm run serve:js'}</CodeExample>
                    <p className="leading-7 text-muted">
                        Open the address printed by the server, usually <code className="font-mono text-sm text-ink">http://127.0.0.1:4173/</code>.
                    </p>
                </>
            ) : (
                <>
                    <CodeExample label="Terminal">{'composer run setup\nexport PATH="$PWD:$PATH"\nphp artisan serve'}</CodeExample>
                    <p className="leading-7 text-muted">
                        Use setup once in a fresh checkout: it installs dependencies, creates your local environment, prepares SQLite, and builds the frontend. If your app is already set up, run only the server command. Open the address printed by Artisan, usually <code className="font-mono text-sm text-ink">http://127.0.0.1:8000/</code>, then choose PHP in Maiden Voyage.
                    </p>
                    <p className="mt-4 leading-7 text-muted">
                        Slipstream is included by default through <code className="font-mono text-sm text-ink">parallax/cli</code>.
                        On Linux or WSL, the PATH command selects this checkout's Slipstream executable for the current shell.
                        Run it again in each new shell from the project directory, or use <code className="font-mono text-sm text-ink">./slipstream</code> directly.
                        Artisan remains available for ordinary Laravel commands.
                    </p>
                </>
            )}
            <SectionHeading id="first-app">Build your first app</SectionHeading>
            <p className="leading-7 text-muted">
                Maiden Voyage walks you through three edits: name your app, connect the Save button, and show your saved notes.
                Each step explains what to change, why it matters, and what you should see.
            </p>
            <p className="mt-4 border-l-2 border-brand-border pl-4 leading-7 text-muted">
                <strong className="font-semibold text-ink">Expected result:</strong> an app that saves an idea, displays it, and keeps it after a reload.
                {edition === 'js' ? ' Browser notes stay in the same browser and site.' : ' PHP notes stay with the same browser session.'}
            </p>
            <p className="mt-7 leading-7 text-muted">
                Next: <a className="text-brand-light underline underline-offset-4 hover:text-ink" href={nextUrl}>see how the Notes module fits together</a>.
            </p>
        </>
    );
}

function Modules({ nextUrl }) {
    return (
        <>
            <p className="text-lg leading-8 text-muted">
                A module keeps one application feature together under the root modules directory: its routes, PHP behavior, database files, and React screen.
            </p>
            <p className="mt-4 leading-7 text-muted">
                Notes is our first module. Maiden Voyage and the Notes page use the same notes behavior.
                The React screen receives data and a save callback; the page connects it to browser storage or PHP.
            </p>
            <SectionHeading id="files">Where the files live</SectionHeading>
            <CodeExample label="Built-in Notes module">{`modules/notes/
  src/
    Providers/NotesServiceProvider.php
    Notes.php
    Models/Note.php
    Http/Controllers/NotesController.php
    Http/Requests/StoreNoteRequest.php
  routes/web.php
  database/migrations/
  database/factories/NoteFactory.php
  resources/js/
    NotesApp.jsx
    browser.js
    Pages/Notes.jsx`}</CodeExample>
            <dl className="space-y-4 leading-7 text-muted">
                <div>
                    <dt className="font-semibold text-ink">Feature</dt>
                    <dd><code className="font-mono text-sm text-ink">NotesApp.jsx</code> renders the form and list. <code className="font-mono text-sm text-ink">browser.js</code> validates and saves browser notes.</dd>
                </div>
                <div>
                    <dt className="font-semibold text-ink">Page</dt>
                    <dd><code className="font-mono text-sm text-ink">Pages/Notes.jsx</code> connects the screen to its data and chooses JS or PHP storage.</dd>
                </div>
                <div>
                    <dt className="font-semibold text-ink">PHP module</dt>
                    <dd>The Notes namespace belongs to this module. Its provider loads routes and migrations; the controller, request, service, and model handle database notes.</dd>
                </div>
            </dl>
            <p className="mt-4 leading-7 text-muted">
                PHP migrations and factories stay inside their module. The provider registers its migrations with Laravel.
                The page is named <code className="font-mono text-sm text-ink">notes/Notes</code> in Inertia; the first part identifies its module.
            </p>
            <SectionHeading id="reuse">Reuse the screen</SectionHeading>
            <p className="leading-7 text-muted">
                Import the component from another page. This small example supplies one note and logs submitted titles to the browser console.
            </p>
            <CodeExample label="resources/js/Pages/IdeasPreview.jsx">{`import React from 'react';
import NotesApp from '../../../modules/notes/resources/js/NotesApp.jsx';

export default function IdeasPreview() {
    return (
        <NotesApp
            appName="My ideas"
            notes={[{ id: '1', title: 'Build something fun' }]}
            onSave={(title) => console.log(title)}
            error={null}
        />
    );
}`}</CodeExample>
            <p className="leading-7 text-muted">
                To open this page, add a route in the Laravel/Inertia app:
            </p>
            <CodeExample label="routes/web.php">{`use Inertia\\Inertia;

Route::get('/ideas-preview', fn () => Inertia::render('IdeasPreview'))
    ->name('ideas.preview');`}</CodeExample>
            <p className="mb-5 leading-7 text-muted">
                Keep the existing routes and imports; Route is already imported in this file. Run <code className="font-mono text-sm text-ink">npm run build</code>,
                then visit <code className="font-mono text-sm text-ink">/ideas-preview</code> on your Laravel server.
                This route example uses the Laravel/Inertia app, rather than the standalone browser tour.
            </p>
            <p className="border-l-2 border-brand-border pl-4 leading-7 text-muted">
                <strong className="font-semibold text-ink">Expected result:</strong> the same Notes screen with your title and sample note.
                To save data, connect <code className="font-mono text-sm text-ink">onSave</code> to the browser service or PHP handler, as the existing Notes page does.
            </p>
            <SectionHeading id="register">Register a module</SectionHeading>
            <p className="leading-7 text-muted">
                A module with PHP routes needs a Composer namespace mapping and an explicit provider.
                For example, after generating an Ideas kit, add this entry inside <code className="font-mono text-sm text-ink">autoload.psr-4</code> in <code className="font-mono text-sm text-ink">composer.json</code>.
                Keep the existing mappings and use commas between entries:
            </p>
            <CodeExample label="Composer autoload entry">{'"Ideas\\\\": "modules/ideas/src/",'}</CodeExample>
            <p className="mt-4 leading-7 text-muted">Add the provider to the existing array in <code className="font-mono text-sm text-ink">bootstrap/providers.php</code>:</p>
            <CodeExample label="bootstrap/providers.php">{`return [
    App\\Providers\\AppServiceProvider::class,
    Notes\\Providers\\NotesServiceProvider::class,
    Ideas\\Providers\\IdeasServiceProvider::class,
];`}</CodeExample>
            <p className="leading-7 text-muted">Keep your existing providers in the list, then refresh Composer's autoload files:</p>
            <CodeExample label="Autoload command">{'composer dump-autoload'}</CodeExample>
            <p className="leading-7 text-muted">Composer loads the Ideas namespace; its provider makes the module's routes available.</p>
            <p className="mt-7 leading-7 text-muted">
                Next: <a className="text-brand-light underline underline-offset-4 hover:text-ink" href={nextUrl}>generate your own module with a Slipstream kit</a>.
            </p>
        </>
    );
}

function SlipstreamKits({ edition, moduleName, standalone, tourUrl }) {
    return (
        <>
            <p className="text-lg leading-8 text-muted">
                A Slipstream kit copies a working feature into your app. The generated files are yours to edit.
            </p>
            <p className="mt-4 leading-7 text-muted">
                The first kit is Notes. It generates a React module, an Inertia page, and a PHP route provider.
                JS stores notes in the browser. PHP adds database storage, validation, and a module migration.
            </p>
            <SectionHeading id="requirements">Before you generate</SectionHeading>
            <p className="leading-7 text-muted">
                Run the generator from a Zefram checkout set up with PHP 8.4 or later, Composer, and Node.js 24 with npm.
                Both kit editions use the included Slipstream CLI and the Laravel/Inertia app to serve their page.
                The standalone browser preview is for Maiden Voyage; it does not install a generated kit.
            </p>
            <SectionHeading id="generate">Name it, scaffold it, run it</SectionHeading>
            <KitSetup name={moduleName} edition={edition} standalone={standalone} />
            <SectionHeading id="customize">Make it yours</SectionHeading>
            <p className="leading-7 text-muted">
                Start in the generated <code className="font-mono text-sm text-ink">NotesApp.jsx</code> to change the form, layout, or copy.
                Change the browser service or PHP files when you need different behavior. Rebuild after frontend changes.
            </p>
            <p className="mt-4 leading-7 text-muted">
                Each generated module has its own storage. The generator refuses to overwrite existing files, so choose a new name for another module.
            </p>
            <p className="mt-7 leading-7 text-muted">
                Want to try the pieces first? <a className="text-brand-light underline underline-offset-4 hover:text-ink" href={tourUrl}>Take Maiden Voyage</a>.
            </p>
        </>
    );
}

export default function Docs({ section = 'getting-started', edition = 'js', moduleName = 'Ideas', standalone = false }) {
    const currentPage = pages.find((page) => page.id === section) || pages[0];
    const options = { edition, name: moduleName, standalone };
    const tourUrl = standalone ? window.location.pathname : `/?edition=${edition}`;
    const linkClass = 'rounded-md px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-light';

    return (
        <>
            {!standalone && <Head title={`${currentPage.title} · Docs`} />}
            <div className="min-h-screen bg-[#090810] text-ink">
                <header className="border-b border-hair bg-surface/70">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
                        <a href={tourUrl} aria-label="Zefram home"><img src={zeframLockup} alt="Zefram" className="h-auto w-[175px]" /></a>
                        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-2">
                            <a href={docsUrl('getting-started', options)} aria-current="page" className={`${linkClass} text-brand-light`}>Docs</a>
                            <a href={tourUrl} className={`${linkClass} text-muted hover:text-ink`}>Maiden Voyage</a>
                            {!standalone && <a href={`/notes?edition=${edition}`} className={`${linkClass} text-muted hover:text-ink`}>Notes</a>}
                        </nav>
                    </div>
                </header>

                <nav aria-label="Documentation contents" className="border-b border-hair bg-surface">
                    <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-light">Documentation</p>
                        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
                            {pages.map((page, index) => (
                                <a key={page.id} href={docsUrl(page.id, options)}
                                    aria-current={page.id === currentPage.id ? 'page' : undefined}
                                    className={`block border-l-2 pl-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-light ${page.id === currentPage.id ? 'border-brand text-ink' : 'border-hair text-muted hover:border-brand-border hover:text-ink'}`}>
                                    <span className="text-sm font-semibold"><span className="mr-2 text-brand-light">{index + 1}.</span>{page.title}</span>
                                    <span className="mt-1 block text-sm leading-6 text-muted">{page.description}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </nav>

                <main className="mx-auto max-w-4xl px-5 py-10 text-[15px] sm:px-8 sm:py-12">
                    <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-hair pb-6">
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{currentPage.title}</h1>
                        {currentPage.id === 'getting-started' && <div className="flex gap-1 rounded-md border border-brand-border/50 bg-surface p-1" role="group" aria-label="Documentation edition">
                            {['js', 'php'].map((option) => (
                                <a key={option} href={docsUrl(currentPage.id, { ...options, edition: option })}
                                    aria-current={edition === option ? 'true' : undefined}
                                    className={`rounded px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-light ${edition === option ? 'bg-[image:var(--brand-gradient)] text-white' : 'text-muted hover:text-ink'}`}>
                                    {option === 'js' ? 'JS' : 'PHP'}
                                </a>
                            ))}
                        </div>}
                    </div>
                    {currentPage.id === 'getting-started' && <GettingStarted edition={edition} tourUrl={tourUrl} nextUrl={docsUrl('modules', options)} />}
                    {currentPage.id === 'modules' && <Modules nextUrl={docsUrl('slipstream-kits', options)} />}
                    {currentPage.id === 'slipstream-kits' && <SlipstreamKits edition={edition} moduleName={moduleName} standalone={standalone} tourUrl={tourUrl} />}
                </main>
                <footer className="mx-auto max-w-4xl border-t border-hair px-5 py-6 text-sm text-muted sm:px-8">
                    Zefram · React, Tailwind, and room to make it yours.
                </footer>
            </div>
        </>
    );
}
