import React from 'react';
import clsx from 'clsx';

const sizes = {
    xs: 'text-xs/5',
    sm: 'text-sm/6',
    base: 'text-base/7',
};

const tones = {
    default: 'text-slate-200',
    muted: 'text-slate-400',
    subtle: 'text-slate-500',
};

/** Body copy. Links inside it get the accent underline style. */
export function Text({ as: Tag = 'p', size = 'sm', tone = 'muted', className, ...props }) {
    return (
        <Tag
            className={clsx(
                sizes[size] ?? sizes.sm,
                tones[tone] ?? tones.muted,
                '[&_a]:text-accent-200 [&_a]:underline [&_a]:decoration-accent-400/40 [&_a]:underline-offset-4 [&_a:hover]:decoration-accent-300',
                className,
            )}
            {...props}
        />
    );
}

export function Strong({ className, ...props }) {
    return <strong className={clsx('font-semibold text-white', className)} {...props} />;
}

export function Code({ className, ...props }) {
    return (
        <code
            className={clsx('rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[0.85em] text-accent-100', className)}
            {...props}
        />
    );
}

export default Text;
