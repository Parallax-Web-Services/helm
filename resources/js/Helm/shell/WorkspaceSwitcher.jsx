import React from 'react';
import clsx from 'clsx';
import { CloseButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ArrowUpRightIcon, Squares2X2Icon } from '@heroicons/react/16/solid';
import { accentStyle } from '../theme.js';
import { isExternalHref, Link } from '../ui/Link.jsx';
import { BrandMark } from './BrandMark.jsx';

function AppIcon({ app, brand }) {
    const Icon = typeof app.icon === 'function' || (app.icon && typeof app.icon === 'object') ? app.icon : null;
    const image = typeof app.icon === 'string' ? app.icon : app.key === brand.key ? brand.mark : null;

    return (
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-accent-400/25 bg-accent-400/[0.07] text-accent-200">
            {Icon && <Icon aria-hidden="true" className="size-5" />}
            {!Icon && image && <BrandMark src={image} tint={app.key === brand.key ? brand.tintMark !== false : false} className="size-5.5" />}
            {!Icon && !image && <span aria-hidden="true" className="font-display text-sm">{app.name.slice(0, 1)}</span>}
        </span>
    );
}

/**
 * The suite switcher ("app grid"). Shows this app's brand on the button and,
 * when opened, every app in `workspaces`, each in its own accent. Sibling
 * apps share the Nexus sign-in, so hopping between them needs no new login.
 */
export function WorkspaceSwitcher({ brand, workspaces = [], className }) {
    const apps = workspaces.length ? workspaces : [{ key: brand.key, name: brand.name, href: brand.home ?? '/', accent: brand.accent }];

    return (
        <Popover className={clsx('relative', className)}>
            <PopoverButton className="group flex w-full items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition hover:bg-white/[0.04] focus-ring data-open:bg-white/[0.04]">
                <BrandMark src={brand.mark} tint={brand.tintMark !== false} className="size-8" />
                <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-semibold uppercase tracking-[0.2em] text-white">{brand.name}</span>
                    <span className="block truncate text-[10px] uppercase tracking-[0.22em] text-slate-500">{brand.tagline ?? 'Command deck'}</span>
                </span>
                <Squares2X2Icon aria-hidden="true" className="size-4 shrink-0 text-slate-500 transition group-hover:text-accent-200 group-data-open:text-accent-200" />
                <span className="sr-only">Switch app</span>
            </PopoverButton>
            <PopoverPanel
                anchor="bottom start"
                transition
                focus
                className="helm z-50 w-[min(26rem,calc(100vw-24px))] rounded-3xl border border-white/10 bg-deck-panel/95 p-3 text-slate-200 shadow-[0_30px_90px_-16px_rgba(0,0,0,0.8)] backdrop-blur-xl [--anchor-gap:8px] [--anchor-padding:12px] transition duration-150 ease-out data-closed:scale-[0.98] data-closed:opacity-0"
            >
                <div className="flex items-baseline justify-between gap-3 px-2 pb-3 pt-1">
                    <h2 className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">Your suite</h2>
                    <p className="text-[11px] text-slate-500">One Nexus sign-in</p>
                </div>
                <ul role="list" className="grid gap-2 sm:grid-cols-2">
                    {apps.map((app) => {
                        const current = app.key === brand.key;
                        const leaves = app.external ?? isExternalHref(app.href);

                        return (
                            <li key={app.key} className="helm-accent-scope" style={accentStyle(app.accent)}>
                                <CloseButton
                                    as={Link}
                                    href={app.href}
                                    external={leaves}
                                    aria-current={current ? 'page' : undefined}
                                    className={clsx(
                                        'flex h-full flex-col gap-2.5 rounded-2xl border p-3 transition focus-ring',
                                        current
                                            ? 'border-accent-400/35 bg-accent-400/[0.07]'
                                            : 'border-white/8 bg-white/[0.025] hover:border-accent-400/35 hover:bg-accent-400/[0.05]',
                                    )}
                                >
                                    <span className="flex items-center gap-3">
                                        <AppIcon app={app} brand={brand} />
                                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{app.name}</span>
                                        {current && <span className="size-1.5 shrink-0 rounded-full bg-accent-400 shadow-[0_0_8px_var(--helm-glow)]" aria-hidden="true" />}
                                        {leaves && <ArrowUpRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-slate-500" />}
                                    </span>
                                    {app.description && <span className="text-xs/5 text-slate-400">{app.description}</span>}
                                </CloseButton>
                            </li>
                        );
                    })}
                </ul>
            </PopoverPanel>
        </Popover>
    );
}

export default WorkspaceSwitcher;
