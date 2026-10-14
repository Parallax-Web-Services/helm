import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

const sizes = {
    xs: 'size-6 text-[9px]',
    sm: 'size-8 text-[10px]',
    md: 'size-10 text-xs',
    lg: 'size-12 text-sm',
    xl: 'size-16 text-base',
};

/** Up to two initials from a name: "Ada Lovelace" → "AL". */
export function initialsFor(name) {
    return String(name ?? '')
        .trim()
        .split(/\s+/)
        .map((word) => word[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

/**
 * Picture of a person or team, falling back to initials when there is no
 * image (or it fails to load). Pass `decorative` when the name is already
 * written next to it.
 */
export function Avatar({ src, name, initials, size = 'md', square = false, tone, decorative = false, className, style, ...props }) {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [src]);

    const classes = clsx(
        'inline-grid shrink-0 select-none place-items-center overflow-hidden border',
        square ? 'rounded-xl' : 'rounded-full',
        sizes[size] ?? sizes.md,
        className,
    );
    const label = decorative ? undefined : name;

    if (src && !failed) {
        return (
            <img
                src={src}
                alt={label ?? ''}
                aria-hidden={decorative || undefined}
                onError={() => setFailed(true)}
                className={clsx(classes, 'border-white/10 bg-white/5 object-cover')}
                style={style}
                {...props}
            />
        );
    }

    return (
        <span
            role={label ? 'img' : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            className={clsx(
                classes,
                'border-[color-mix(in_oklab,var(--avatar-tone)_28%,transparent)] bg-[color-mix(in_oklab,var(--avatar-tone)_13%,transparent)] font-display font-semibold tracking-wider text-(--avatar-tone)',
            )}
            style={{ '--avatar-tone': tone ?? 'var(--helm-accent-200)', ...style }}
            {...props}
        >
            {initials || initialsFor(name) || '?'}
        </span>
    );
}

export default Avatar;
