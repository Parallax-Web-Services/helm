import React from 'react';
import clsx from 'clsx';
import { Link } from './Link.jsx';

const sizes = {
    sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs [&_svg]:size-4',
    md: 'h-10 gap-2 rounded-xl px-4 text-sm [&_svg]:size-4.5',
    lg: 'h-12 gap-2.5 rounded-xl px-5 text-base [&_svg]:size-5',
};

const iconOnlySizes = {
    sm: 'size-8 rounded-lg [&_svg]:size-4',
    md: 'size-10 rounded-xl [&_svg]:size-5',
    lg: 'size-12 rounded-xl [&_svg]:size-5',
};

const looks = {
    solid: {
        accent: 'bg-accent-400 text-accent-contrast shadow-[0_0_28px_-8px_var(--helm-glow)] hover:bg-accent-300',
        neutral: 'bg-white/10 text-white hover:bg-white/15',
        danger: 'bg-rose-500 text-white hover:bg-rose-400',
    },
    outline: {
        accent: 'border border-accent-400/40 bg-accent-400/[0.04] text-accent-100 hover:border-accent-300/70 hover:bg-accent-400/10',
        neutral: 'border border-white/12 bg-white/[0.03] text-slate-200 hover:border-white/25 hover:bg-white/[0.07] hover:text-white',
        danger: 'border border-rose-400/40 text-rose-200 hover:border-rose-300/70 hover:bg-rose-400/10',
    },
    ghost: {
        accent: 'text-accent-200 hover:bg-accent-400/10 hover:text-accent-100',
        neutral: 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
        danger: 'text-rose-300 hover:bg-rose-400/10 hover:text-rose-200',
    },
};

function Spinner() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin motion-reduce:animate-none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

/**
 * Button, or a button-styled link when given `href` (Inertia visit) or
 * `href` + `external` (plain anchor, for off-site and server-redirect routes).
 */
export function Button({
    variant = 'solid',
    tone = 'accent',
    size = 'md',
    href,
    external = false,
    icon: Icon,
    trailingIcon: TrailingIcon,
    loading = false,
    className,
    children,
    type = 'button',
    disabled,
    ...props
}) {
    const iconOnly = !children && (Icon || TrailingIcon);
    const classes = clsx(
        'relative inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold transition duration-150 focus-ring',
        'disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0',
        iconOnly ? iconOnlySizes[size] ?? iconOnlySizes.md : sizes[size] ?? sizes.md,
        (looks[variant] ?? looks.solid)[tone] ?? looks.solid.accent,
        className,
    );

    const content = (
        <>
            {loading ? <Spinner /> : Icon && <Icon aria-hidden="true" />}
            {children}
            {TrailingIcon && <TrailingIcon aria-hidden="true" />}
        </>
    );

    if (href !== undefined) {
        return (
            <Link href={href} external={external} className={classes} {...props}>
                {content}
            </Link>
        );
    }

    return (
        <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={classes} {...props}>
            {content}
        </button>
    );
}

export default Button;
