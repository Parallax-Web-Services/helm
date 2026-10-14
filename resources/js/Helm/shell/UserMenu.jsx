import React from 'react';
import clsx from 'clsx';
import { usePage } from '@inertiajs/react';
import { Menu, MenuButton } from '@headlessui/react';
import { ArrowRightEndOnRectangleIcon, ArrowRightStartOnRectangleIcon, ChevronUpDownIcon, CreditCardIcon, UserCircleIcon } from '@heroicons/react/16/solid';
import { Avatar } from '../ui/Avatar.jsx';
import { Button } from '../ui/Button.jsx';
import { MenuItem, MenuPanel, MenuSeparator } from '../ui/Menu.jsx';

/**
 * The signed-in user's menu: Account, Billing (when Nexus is connected) and
 * Sign out. These routes redirect to Nexus, so they are plain links.
 * `variant="sidebar"` shows name and email; `variant="compact"` just the avatar.
 * Signed-out visitors get a "Sign in" button instead.
 */
export function UserMenu({ variant = 'sidebar', className }) {
    const { auth, nexus } = usePage().props;
    const user = auth?.user;

    if (!user) {
        return (
            <Button href="/login" external icon={ArrowRightEndOnRectangleIcon} size="sm" className={clsx(variant === 'sidebar' && 'w-full', className)}>
                Sign in
            </Button>
        );
    }

    const sidebar = variant === 'sidebar';

    return (
        <Menu>
            <MenuButton
                className={clsx(
                    'group flex items-center text-left transition focus-ring',
                    sidebar
                        ? 'w-full gap-3 rounded-2xl px-2 py-2 hover:bg-white/[0.045] data-open:bg-white/[0.045]'
                        : 'rounded-full p-0.5 hover:ring-2 hover:ring-white/10',
                    className,
                )}
            >
                <Avatar src={user.avatar} name={user.name} initials={user.initials} size={sidebar ? 'md' : 'sm'} square={sidebar} decorative />
                {sidebar ? (
                    <>
                        <span className="min-w-0 flex-1">
                            <span className="sr-only">Account menu for </span>
                            <span className="block truncate text-sm font-semibold text-slate-100">{user.name}</span>
                            <span className="block truncate text-xs text-slate-500">{user.email}</span>
                        </span>
                        <ChevronUpDownIcon aria-hidden="true" className="size-4 shrink-0 text-slate-500 group-hover:text-slate-300" />
                    </>
                ) : (
                    <span className="sr-only">Account menu for {user.name}</span>
                )}
            </MenuButton>
            <MenuPanel anchor={sidebar ? 'top start' : 'bottom end'} className={clsx(sidebar && 'w-(--button-width)', 'min-w-64')}>
                {!sidebar && (
                    <>
                        <div className="px-3 pb-2 pt-1.5">
                            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                            <p className="truncate text-xs text-slate-500">{user.email}</p>
                        </div>
                        <MenuSeparator />
                    </>
                )}
                <MenuItem href="/account" external icon={UserCircleIcon}>Account</MenuItem>
                {nexus?.url && <MenuItem href="/billing" external icon={CreditCardIcon}>Billing</MenuItem>}
                <MenuSeparator />
                <MenuItem href="/logout" external icon={ArrowRightStartOnRectangleIcon}>Sign out</MenuItem>
            </MenuPanel>
        </Menu>
    );
}

export default UserMenu;
