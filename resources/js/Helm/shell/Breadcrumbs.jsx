import React from 'react';
import clsx from 'clsx';
import { HomeIcon } from '@heroicons/react/20/solid';
import { ChevronRightIcon } from '@heroicons/react/16/solid';
import { Link } from '../ui/Link.jsx';

/**
 * Trail of links back to `home`. Items: [{ label, href? }]; the last item is
 * the current page. Small screens show only the home link and the last item.
 */
export function Breadcrumbs({ items = [], home = { label: 'Home', href: '/' }, className }) {
    return (
        <nav aria-label="Breadcrumb" className={clsx('min-w-0', className)}>
            <ol role="list" className="flex min-w-0 items-center gap-1.5 text-sm">
                <li className="flex shrink-0">
                    <Link href={home.href} className="rounded-md p-0.5 text-slate-500 transition hover:text-accent-200 focus-ring">
                        <HomeIcon aria-hidden="true" className="size-4.5" />
                        <span className="sr-only">{home.label}</span>
                    </Link>
                </li>
                {items.map((item, index) => {
                    const last = index === items.length - 1;

                    return (
                        <li key={`${item.label}-${index}`} className={clsx('flex min-w-0 items-center gap-1.5', !last && 'max-sm:hidden')}>
                            <ChevronRightIcon aria-hidden="true" className="size-4 shrink-0 text-slate-600" />
                            {item.href && !last ? (
                                <Link href={item.href} className="truncate rounded text-slate-400 transition hover:text-slate-100 focus-ring">
                                    {item.label}
                                </Link>
                            ) : (
                                <span aria-current={last ? 'page' : undefined} className="truncate font-medium text-slate-200">
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export default Breadcrumbs;
