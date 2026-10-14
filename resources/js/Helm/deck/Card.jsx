import React from 'react';
import clsx from 'clsx';

/** Inner tile for grouping content on the deck. `interactive` adds a hover lift for clickable cards. */
export function Card({ as: Tag = 'div', interactive = false, className, children, ...props }) {
    return (
        <Tag
            className={clsx(
                'rounded-[22px] border border-white/8 bg-white/[0.035] p-5',
                interactive && 'transition hover:border-accent-400/30 hover:bg-white/[0.055]',
                className,
            )}
            {...props}
        >
            {children}
        </Tag>
    );
}

export default Card;
