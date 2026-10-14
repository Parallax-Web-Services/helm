import React from 'react';
import clsx from 'clsx';

/** Rank-insignia style progress: `filled` lit pips out of `total`. */
export function Pips({ total, filled = 0, label, className }) {
    return (
        <span role="img" aria-label={label ?? `${filled} of ${total} complete`} className={clsx('inline-flex items-center gap-1.5', className)}>
            {Array.from({ length: total }, (_, index) => (
                <span
                    key={index}
                    className={clsx(
                        'size-2.5 rounded-full',
                        index < filled ? 'bg-accent-300 shadow-[0_0_10px_var(--helm-glow)]' : 'border border-accent-300/45',
                    )}
                />
            ))}
        </span>
    );
}

export default Pips;
