import React from 'react';
import clsx from 'clsx';

/** Uppercase tracked kicker above a title. `live` adds a glowing status light. */
export function Eyebrow({ as: Tag = 'p', live = false, className, children, ...props }) {
    return (
        <Tag
            className={clsx('flex items-center gap-2.5 text-[11px]/5 font-semibold uppercase tracking-[0.28em] text-accent-200/85', className)}
            {...props}
        >
            {live && (
                <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent-300 shadow-[0_0_14px_var(--helm-glow)] motion-safe:animate-pulse" />
            )}
            {children}
        </Tag>
    );
}

export default Eyebrow;
