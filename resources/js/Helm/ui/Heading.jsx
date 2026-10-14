import React from 'react';
import clsx from 'clsx';

/** Page or panel title in the deck's display face. `level` picks h1–h6. */
export function Heading({ level = 1, className, children, ...props }) {
    const Tag = `h${level}`;

    return (
        <Tag
            className={clsx(
                'font-display tracking-[0.08em] text-balance break-words text-white',
                level === 1 ? 'text-2xl/tight sm:text-3xl/tight' : 'text-lg/snug sm:text-xl/snug',
                className,
            )}
            {...props}
        >
            {children}
        </Tag>
    );
}

/** Section title: small, uppercase and tracked. */
export function Subheading({ level = 2, className, children, ...props }) {
    const Tag = `h${level}`;

    return (
        <Tag className={clsx('text-xs/5 font-semibold uppercase tracking-[0.22em] text-slate-300', className)} {...props}>
            {children}
        </Tag>
    );
}

export default Heading;
