import React from 'react';
import clsx from 'clsx';
import { usePage } from '@inertiajs/react';
import { Link } from '../ui/Link.jsx';
import { isCurrentItem, pathOf } from './navigation.js';

/**
 * Sub-navigation between sibling pages. Tabs: [{ label, href, count?, match?, current? }].
 * A tab is current when the URL path equals its href (or matches one of its
 * `match` prefixes), unless `current` says otherwise. Scrolls sideways on small screens.
 */
export function Tabs({ tabs = [], label = 'Sections', className }) {
    const { url } = usePage();

    return (
        <nav aria-label={label} className={clsx('-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0', className)}>
            <ul role="list" className="flex min-w-max gap-1 border-b border-white/8">
                {tabs.map((tab) => {
                    const current = tab.current ?? (tab.match?.length ? isCurrentItem(url, tab) : pathOf(url) === pathOf(tab.href));

                    return (
                        <li key={tab.href ?? tab.label}>
                            <Link
                                href={tab.href}
                                external={tab.external}
                                aria-current={current ? 'page' : undefined}
                                className={clsx(
                                    'relative inline-flex items-center gap-2 rounded-t-lg px-3 py-3 text-sm font-medium transition-colors focus-ring-inset',
                                    current ? 'text-white' : 'text-slate-400 hover:text-slate-100',
                                )}
                            >
                                {tab.label}
                                {tab.count != null && (
                                    <span
                                        className={clsx(
                                            'rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums',
                                            current ? 'bg-accent-400/15 text-accent-100' : 'bg-white/8 text-slate-400',
                                        )}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                                {current && (
                                    <span aria-hidden="true" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent-400 shadow-[0_0_10px_var(--helm-glow)]" />
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

export default Tabs;
