import React from 'react';
import clsx from 'clsx';

/**
 * The deck's main glass surface: a translucent panel with hairline border,
 * ambient accent lighting and a faint instrument grid behind its content.
 */
export function Panel({ as: Tag = 'section', ambient = true, grid = true, padded = true, className, children, ...props }) {
    return (
        <Tag
            className={clsx(
                'relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-deck-panel/75 text-slate-200 shadow-[0_36px_120px_-24px_rgba(1,3,10,0.75)] backdrop-blur-md',
                padded && 'p-5 sm:p-8',
                className,
            )}
            {...props}
        >
            {ambient && <div aria-hidden="true" className="helm-ambient pointer-events-none absolute inset-0 -z-10" />}
            {grid && <div aria-hidden="true" className="helm-grid pointer-events-none absolute inset-0 -z-10 opacity-70" />}
            {children}
        </Tag>
    );
}

export default Panel;
