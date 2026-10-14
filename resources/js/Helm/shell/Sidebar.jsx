import React, { useId } from 'react';
import clsx from 'clsx';
import { ArrowUpRightIcon } from '@heroicons/react/16/solid';
import { Link } from '../ui/Link.jsx';

/** Sidebar column: a fixed `header`, a scrolling navigation body, and a fixed `footer`. */
export function Sidebar({ header, footer, label = 'Main', className, children }) {
    return (
        <div className={clsx('flex h-full min-h-0 flex-col', className)}>
            {header && <div className="flex shrink-0 flex-col gap-3 border-b border-white/8 p-4">{header}</div>}
            <nav aria-label={label} className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto overscroll-contain p-4">
                {children}
            </nav>
            {footer && <div className="shrink-0 border-t border-white/8 p-3">{footer}</div>}
        </div>
    );
}

/** A titled group of <SidebarItem>s. */
export function SidebarSection({ title, className, children }) {
    const id = useId();

    return (
        <div className={className}>
            {title && (
                <h2 id={id} className="mb-2 px-3 font-display text-[10px]/5 font-semibold uppercase tracking-[0.26em] text-slate-500">
                    {title}
                </h2>
            )}
            <ul role="list" aria-labelledby={title ? id : undefined} className="grid gap-0.5">
                {children}
            </ul>
        </div>
    );
}

/** Pushes the sections after it to the bottom of the sidebar. */
export function SidebarSpacer() {
    return <div aria-hidden="true" className="flex-1" />;
}

/** One navigation link. `current` lights it up and sets aria-current; `badge` shows a count. */
export function SidebarItem({ href, icon: Icon, current = false, external = false, badge, className, children, ...props }) {
    return (
        <li className="relative">
            {current && (
                <span aria-hidden="true" className="absolute inset-y-1.5 -left-4 w-0.5 rounded-r-full bg-accent-400 shadow-[0_0_12px_var(--helm-glow)]" />
            )}
            <Link
                href={href}
                external={external}
                aria-current={current ? 'page' : undefined}
                className={clsx(
                    'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-ring-inset',
                    current
                        ? 'bg-accent-400/10 text-white'
                        : 'text-slate-400 hover:bg-white/[0.045] hover:text-slate-100',
                    className,
                )}
                {...props}
            >
                {Icon && (
                    <Icon
                        aria-hidden="true"
                        className={clsx('size-5 shrink-0 transition-colors', current ? 'text-accent-300' : 'text-slate-500 group-hover:text-slate-300')}
                    />
                )}
                <span className="min-w-0 flex-1 truncate">{children}</span>
                {badge != null && (
                    <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-300">{badge}</span>
                )}
                {external && <ArrowUpRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-slate-600" />}
            </Link>
        </li>
    );
}

export default Sidebar;
