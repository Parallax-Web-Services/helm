import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { router } from '@inertiajs/react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/20/solid';

const DESKTOP = '(min-width: 64rem)';

/**
 * The command-deck frame. `sidebar` is shown as a fixed rail on large
 * screens and inside a slide-over drawer on small ones; `topbar` fills the
 * sticky bar beside the menu button. Set `topbarOnDesktop={false}` to keep
 * the bar for small screens only.
 */
export function AppShell({ sidebar, topbar, topbarOnDesktop = true, children }) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Close the drawer after any Inertia visit, and if the window grows into the desktop layout.
    useEffect(() => router.on('navigate', () => setDrawerOpen(false)), []);
    useEffect(() => {
        const desktop = window.matchMedia(DESKTOP);
        const close = (event) => event.matches && setDrawerOpen(false);
        desktop.addEventListener('change', close);

        return () => desktop.removeEventListener('change', close);
    }, []);

    return (
        <div className="helm relative isolate min-h-dvh bg-deck text-slate-200">
            <div aria-hidden="true" className="helm-ambient pointer-events-none fixed inset-0 -z-10" />

            <a
                href="#main"
                className="sr-only z-50 rounded-lg bg-accent-400 px-4 py-2 text-sm font-semibold text-accent-contrast focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
            >
                Skip to content
            </a>

            <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/8 bg-deck-rail/85 backdrop-blur-xl lg:flex">
                {sidebar}
            </aside>

            <Dialog open={drawerOpen} onClose={() => setDrawerOpen(false)} className="relative z-50 lg:hidden">
                <DialogBackdrop transition className="fixed inset-0 bg-[#010308]/70 backdrop-blur-sm transition-opacity duration-300 ease-out data-closed:opacity-0" />
                <div className="fixed inset-0 flex">
                    <DialogPanel
                        transition
                        className="helm relative flex w-full max-w-[19rem] flex-col border-r border-white/10 bg-deck-rail text-slate-200 shadow-2xl transition duration-300 ease-out data-closed:-translate-x-full"
                    >
                        <DialogTitle className="sr-only">Navigation</DialogTitle>
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(false)}
                            className="absolute -right-12 top-3 grid size-9 place-items-center rounded-xl border border-white/10 bg-deck-panel text-slate-300 hover:text-white focus-ring"
                        >
                            <XMarkIcon aria-hidden="true" className="size-5" />
                            <span className="sr-only">Close navigation</span>
                        </button>
                        {sidebar}
                    </DialogPanel>
                </div>
            </Dialog>

            <div className="flex min-h-dvh flex-col lg:pl-72">
                <header
                    className={clsx(
                        'sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-white/8 bg-deck/75 px-4 backdrop-blur-xl sm:px-6 lg:px-10',
                        !topbarOnDesktop && 'lg:hidden',
                    )}
                >
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        aria-expanded={drawerOpen}
                        className="-ml-1.5 grid size-9 place-items-center rounded-xl text-slate-300 hover:bg-white/5 hover:text-white focus-ring lg:hidden"
                    >
                        <Bars3Icon aria-hidden="true" className="size-5" />
                        <span className="sr-only">Open navigation</span>
                    </button>
                    {topbar}
                </header>
                <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AppShell;
