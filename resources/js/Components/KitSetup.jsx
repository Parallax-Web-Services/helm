import React, { useEffect, useId, useState } from 'react';
import { Button, Input } from './Slipstream.jsx';
import { createKitPlan } from '../slipstream-kit.js';

export function CodeBlock({ code, label }) {
    const [copyStatus, setCopyStatus] = useState(null);

    useEffect(() => setCopyStatus(null), [code]);

    async function copyCode() {
        try {
            if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable.');
            await navigator.clipboard.writeText(code);
            setCopyStatus('Copied.');
        } catch {
            setCopyStatus('Copy is unavailable. Select the code below and copy it manually.');
        }
    }

    return (
        <div className="my-3 overflow-hidden rounded-lg border border-brand-border/45 bg-[#0c0b12]">
            <div className="flex items-center justify-between gap-3 border-b border-brand-border/25 px-4 py-2.5">
                <span className="text-sm text-muted">{label}</span>
                <button type="button" aria-label={`Copy ${label}`} onClick={copyCode} className="rounded px-1 text-sm text-brand-light hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-light">Copy</button>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-sm leading-6 text-ink"><code>{code}</code></pre>
            {copyStatus && <p role="status" className="border-t border-brand-border/25 px-4 py-2 text-sm leading-6 text-muted">{copyStatus}</p>}
        </div>
    );
}

export default function KitSetup({ name = 'Ideas', edition = 'js', standalone = false, onDownload }) {
    const [moduleName, setModuleName] = useState(name);
    const [kitEdition, setKitEdition] = useState(edition);
    const nameId = useId();
    const editionId = useId();
    const errorId = useId();
    const plan = createKitPlan(moduleName, kitEdition);

    return (
        <div>
            <p className="text-base leading-7 text-muted">Copy the Notes kit into a new module, then edit the generated files. Run the commands below in your Zefram project directory.</p>
            <p className="mt-2 text-sm leading-6 text-muted">The kit starts with a working notes app. Your Maiden Voyage edits are not transferred automatically; you can keep them using the component download.</p>
            {standalone && <p className="mt-4 rounded-lg border border-brand-border/45 bg-brand/5 px-4 py-3 text-sm leading-6 text-muted">This is the browser preview. Kit scaffolding requires the Zefram PHP project and Artisan, including for the JS edition. Its React component can also be used in another React app.</p>}

            <form className="my-6 grid gap-4 rounded-lg border border-brand-border/40 bg-surface-raised p-5 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
                <div>
                    <label htmlFor={nameId} className="mb-2 block text-sm font-semibold text-ink">Module name</label>
                    <Input id={nameId} value={moduleName} onChange={(event) => setModuleName(event.target.value)} placeholder="Ideas" autoComplete="off" spellCheck={false} aria-invalid={Boolean(plan.error)} aria-describedby={plan.error ? errorId : undefined} />
                    <p className="mt-2 text-sm leading-6 text-muted">Start with a capital letter. Use letters and numbers.</p>
                </div>
                <div>
                    <label htmlFor={editionId} className="mb-2 block text-sm font-semibold text-ink">Storage edition</label>
                    <select id={editionId} value={kitEdition} onChange={(event) => setKitEdition(event.target.value)} className="w-full rounded-md border border-brand-border/50 bg-surface px-3.5 py-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20">
                        <option value="js">JS · Browser storage</option>
                        <option value="php">PHP · Database storage</option>
                    </select>
                    <p className="mt-2 text-sm leading-6 text-muted">Both kits use React, Tailwind, and Inertia.</p>
                </div>
                {plan.error && <p id={errorId} role="alert" className="text-sm leading-6 text-rose-300 sm:col-span-2">{plan.error}</p>}
            </form>

            {!plan.error && <ol className="space-y-8">
                <li>
                    <h2 className="text-xl font-semibold text-ink">1. Scaffold {plan.name}</h2>
                    <CodeBlock label="Scaffold command" code={plan.command} />
                    <p className="text-sm leading-6 text-muted">Expected result: Artisan lists the files it created and prints your setup steps. It refuses existing module names and files. Choose another name if it reports a conflict.</p>
                    <details className="mt-3">
                        <summary className="cursor-pointer rounded text-sm text-brand-light focus-visible:outline-2 focus-visible:outline-brand-light">Files this kit creates</summary>
                        <ul className="mt-3 space-y-2">
                            {plan.files.map((file) => <li key={file} className="break-words font-mono text-sm leading-6 text-muted">{file}</li>)}
                        </ul>
                        {kitEdition === 'php' && <p className="mt-2 text-sm leading-6 text-muted">The migration filename starts with the generation timestamp.</p>}
                    </details>
                </li>
                <li>
                    <h2 className="text-xl font-semibold text-ink">2. Register the module</h2>
                    <p className="mt-3 text-sm leading-6 text-muted">Open <code className="text-ink">bootstrap/providers.php</code>. Add this entry inside its existing <code className="text-ink">return [ ... ];</code> array. Keep the existing providers.</p>
                    <CodeBlock label="Provider entry" code={plan.providerLine} />
                    <p className="text-sm leading-6 text-muted">The provider loads your module's routes{kitEdition === 'php' ? ' and migrations' : ''}. This makes <code className="text-ink">{plan.visitPath}</code> available in your app.</p>
                </li>
                <li>
                    <h2 className="text-xl font-semibold text-ink">3. Keep your edits</h2>
                    <p className="mt-3 text-sm leading-6 text-muted">Optional: download <code className="text-ink">App.jsx</code> from Maiden Voyage, then use its contents to replace <code className="break-words text-ink">{plan.componentPath}</code> before building. The generated page supplies the same <code className="text-ink">notes</code>, <code className="text-ink">onSave</code>, and <code className="text-ink">error</code> props.</p>
                    {onDownload && <Button variant="secondary" onClick={onDownload} className="mt-3">Download App.jsx</Button>}
                    <p className="mt-2 text-sm leading-6 text-muted">You can also start with the generated component and customize it later.</p>
                </li>
                <li>
                    <h2 className="text-xl font-semibold text-ink">4. Build and run</h2>
                    {plan.migrationCommand && <>
                        <CodeBlock label="Migration command" code={plan.migrationCommand} />
                        <p className="text-sm leading-6 text-muted">Creates this module's notes table in the database configured by your project.</p>
                    </>}
                    <CodeBlock label="Build command" code={plan.buildCommand} />
                    <p className="text-sm leading-6 text-muted">Compiles your React page and Tailwind styles. If your Laravel server is not running, start it:</p>
                    <CodeBlock label="Server command" code={plan.serveCommand} />
                    <p className="text-sm leading-6 text-muted">Use the address Artisan prints, then open <code className="text-ink">{plan.visitPath}</code>.{standalone ? ' Generated modules run on that Laravel server.' : ' If you are already viewing these docs on your Laravel server, use the link below.'}</p>
                    {!standalone && <a href={plan.visitPath} className="mt-3 inline-flex rounded-md border border-brand-border bg-[image:var(--brand-gradient)] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-light">Open {plan.visitPath}</a>}
                    <p className="mt-4 text-sm leading-6 text-muted">Expected result: your notes app opens. Save a note and reload the page; the note stays {kitEdition === 'js' ? 'in this browser' : 'in your database session'}. This new module starts with its own notes.</p>
                </li>
            </ol>}
        </div>
    );
}
