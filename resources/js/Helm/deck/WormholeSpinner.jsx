import React from 'react';
import clsx from 'clsx';

const sizes = {
    sm: 'size-8',
    md: 'size-14',
    lg: 'size-20',
};

/**
 * Loading indicator: counter-rotating accent rings around a pulsing core.
 * It holds still when the visitor prefers reduced motion; the label is
 * announced either way.
 */
export function WormholeSpinner({ size = 'md', label = 'Loading', className }) {
    return (
        <span role="status" className={clsx('relative inline-grid shrink-0 place-items-center', sizes[size] ?? sizes.md, className)}>
            <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-transparent border-l-accent-300 border-t-accent-300/35 blur-[0.5px] animate-orbit motion-reduce:animate-none" />
            <span aria-hidden="true" className="absolute inset-[15%] rounded-full border-2 border-transparent border-b-accent-500/40 border-r-accent-400 animate-orbit-reverse motion-reduce:animate-none" />
            <span aria-hidden="true" className="absolute inset-[30%] rounded-full border-2 border-transparent border-t-accent-200 animate-orbit-fast motion-reduce:animate-none" />
            <span aria-hidden="true" className="absolute inset-[42%] rounded-full bg-accent-300 shadow-[0_0_16px_4px_var(--helm-glow)] animate-core motion-reduce:animate-none" />
            <span className="sr-only">{label}</span>
        </span>
    );
}

export default WormholeSpinner;
