import React from 'react';
import clsx from 'clsx';
import {
    Menu as HeadlessMenu,
    MenuButton,
    MenuHeading as HeadlessMenuHeading,
    MenuItem as HeadlessMenuItem,
    MenuItems,
    MenuSection as HeadlessMenuSection,
    MenuSeparator as HeadlessMenuSeparator,
} from '@headlessui/react';
import { Link } from './Link.jsx';

/**
 * Dropdown menu on Headless UI (arrow keys, type-ahead, Escape):
 *
 *   <Menu>
 *     <MenuTrigger>Options</MenuTrigger>
 *     <MenuPanel>
 *       <MenuItem href="/account" external icon={UserIcon}>Account</MenuItem>
 *       <MenuSeparator />
 *       <MenuItem onClick={archive} tone="danger">Archive</MenuItem>
 *     </MenuPanel>
 *   </Menu>
 */
export function Menu(props) {
    return <HeadlessMenu {...props} />;
}

export function MenuTrigger({ className, ...props }) {
    return <MenuButton className={clsx('focus-ring', className)} {...props} />;
}

export function MenuPanel({ anchor = 'bottom end', className, children, ...props }) {
    return (
        <MenuItems
            anchor={anchor}
            transition
            className={clsx(
                'helm z-50 min-w-56 rounded-2xl border border-white/10 bg-deck-panel/95 p-1.5 text-slate-200 shadow-[0_24px_70px_-12px_rgba(0,0,0,0.75)] backdrop-blur-xl outline-none',
                '[--anchor-gap:8px] [--anchor-padding:12px] transition duration-100 ease-out data-closed:scale-[0.97] data-closed:opacity-0',
                className,
            )}
            {...props}
        >
            {children}
        </MenuItems>
    );
}

const itemTones = {
    neutral: 'text-slate-200 data-focus:bg-white/[0.07] data-focus:text-white',
    danger: 'text-rose-200 data-focus:bg-rose-400/10 data-focus:text-rose-100',
};

/**
 * A link (`href`, Inertia visit; add `external` for a plain anchor) or an
 * action (`onClick`). `icon` / `trailingIcon` take heroicons, `leading` /
 * `trailing` take any element (an avatar, a check), and `hint` adds a muted line.
 */
export function MenuItem({ href, external, icon: Icon, trailingIcon: TrailingIcon, leading, trailing, hint, tone = 'neutral', className, children, ...props }) {
    const linkProps = href !== undefined ? { as: Link, href, external } : { as: 'button', type: 'button' };

    return (
        <HeadlessMenuItem
            {...linkProps}
            className={clsx(
                'group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors data-disabled:opacity-50',
                itemTones[tone] ?? itemTones.neutral,
                className,
            )}
            {...props}
        >
            {leading}
            {Icon && <Icon aria-hidden="true" className="size-4.5 shrink-0 text-slate-500 group-data-focus:text-accent-300" />}
            <span className="min-w-0 flex-1">
                <span className="block truncate">{children}</span>
                {hint && <span className="block truncate text-xs text-slate-500">{hint}</span>}
            </span>
            {trailing}
            {TrailingIcon && <TrailingIcon aria-hidden="true" className="size-4 shrink-0 text-slate-500" />}
        </HeadlessMenuItem>
    );
}

export function MenuSection({ className, ...props }) {
    return <HeadlessMenuSection className={className} {...props} />;
}

/** Title for a <MenuSection>; it must sit inside one. */
export function MenuHeading({ className, ...props }) {
    return (
        <HeadlessMenuHeading
            className={clsx('px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500', className)}
            {...props}
        />
    );
}

export function MenuSeparator({ className }) {
    return <HeadlessMenuSeparator className={clsx('mx-2 my-1.5 h-px bg-white/8', className)} />;
}

export default Menu;
