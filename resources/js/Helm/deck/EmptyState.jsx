import React from 'react';
import clsx from 'clsx';
import { SparklesIcon } from '@heroicons/react/24/outline';

/** Placeholder for a list or panel with nothing in it yet, with an optional call to action. */
export function EmptyState({ icon: Icon = SparklesIcon, title, description, action, className, children }) {
    return (
        <div className={clsx('flex flex-col items-center rounded-[22px] border border-dashed border-white/15 bg-white/[0.015] px-6 py-10 text-center sm:py-12', className)}>
            <span className="grid size-12 place-items-center rounded-2xl border border-accent-400/25 bg-accent-400/[0.07] text-accent-200 shadow-[0_0_30px_-10px_var(--helm-glow)]">
                <Icon aria-hidden="true" className="size-6" />
            </span>
            {title && <p className="mt-4 text-sm font-semibold text-white">{title}</p>}
            {description && <p className="mt-1.5 max-w-sm text-sm/6 text-slate-400">{description}</p>}
            {children}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export default EmptyState;
