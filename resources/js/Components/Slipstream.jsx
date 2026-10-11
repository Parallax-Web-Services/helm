import React from 'react';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

export function Button({ children, className, variant = 'primary', type = 'button', ...props }) {
    return (
        <button
            type={type}
            className={joinClasses(
                'inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-light disabled:cursor-not-allowed disabled:opacity-50',
                variant === 'primary'
                    ? 'border-brand-border bg-[image:var(--brand-gradient)] text-white hover:brightness-110'
                    : 'border-brand-border/50 bg-surface-raised text-ink hover:border-brand hover:bg-brand/10',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}

export function Input({ className, ...props }) {
    return (
        <input
            className={joinClasses(
                'w-full rounded-md border border-brand-border/50 bg-surface px-3.5 py-3 text-sm text-ink outline-none placeholder:text-dim focus:border-brand focus:ring-2 focus:ring-brand/20',
                className,
            )}
            {...props}
        />
    );
}

export function Card({ children, className, ...props }) {
    return (
        <section className={joinClasses('rounded-lg border border-brand-border/40 bg-surface-raised p-5', className)} {...props}>
            {children}
        </section>
    );
}
