import React from 'react';
import clsx from 'clsx';

const tones = {
    neutral: 'border-white/10 bg-white/[0.05] text-slate-300',
    accent: 'border-accent-400/30 bg-accent-400/12 text-accent-100',
    success: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
    warning: 'border-amber-300/28 bg-amber-300/10 text-amber-100',
    danger: 'border-rose-400/30 bg-rose-400/12 text-rose-100',
    info: 'border-sky-300/25 bg-sky-300/10 text-sky-100',
};

/** Small uppercase status chip. `dot` adds a status light; `pulse` animates it. */
export function Badge({ tone = 'neutral', dot = false, pulse = false, className, children, ...props }) {
    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px]/5 font-semibold uppercase tracking-[0.18em]',
                tones[tone] ?? tones.neutral,
                className,
            )}
            {...props}
        >
            {(dot || pulse) && (
                <span aria-hidden="true" className={clsx('size-1.5 shrink-0 rounded-full bg-current', pulse && 'motion-safe:animate-pulse')} />
            )}
            {children}
        </span>
    );
}

export default Badge;
