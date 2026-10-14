import React from 'react';
import clsx from 'clsx';
import { router, usePage } from '@inertiajs/react';
import { Menu, MenuButton } from '@headlessui/react';
import { ArrowTopRightOnSquareIcon, CheckIcon, ChevronUpDownIcon, Cog6ToothIcon } from '@heroicons/react/16/solid';
import { Avatar } from '../ui/Avatar.jsx';
import { MenuHeading, MenuItem, MenuPanel, MenuSection, MenuSeparator } from '../ui/Menu.jsx';

const TEAM_TONES = ['#93c5fd', '#c4b5fd', '#6ee7b7', '#fcd34d', '#fda4af', '#67e8f9', '#fdba74'];

// A stable colour per team, so teams are recognisable at a glance.
function teamTone(team) {
    const hash = Array.from(String(team.id)).reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);

    return TEAM_TONES[hash % TEAM_TONES.length];
}

/**
 * The signed-in user's teams from Nexus (`auth.teams`), with the current one
 * (`auth.team`) on the button. Picking another team PUTs /team/{id}; "Manage
 * team" hops to Nexus through /teams.
 */
export function TeamSwitcher({ className }) {
    const { auth } = usePage().props;

    if (!auth?.user) {
        return null;
    }

    const current = auth.team ?? null;
    const isCurrent = (team) => String(team.id) === String(current?.id);
    const teams = [...(auth.teams ?? [])].sort((a, b) => Number(isCurrent(b)) - Number(isCurrent(a)) || a.name.localeCompare(b.name));
    const switchTo = (team) => {
        if (!isCurrent(team)) {
            router.put(`/team/${team.id}`, {}, { preserveScroll: true });
        }
    };

    return (
        <Menu>
            <MenuButton
                className={clsx(
                    'group flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-accent-400/[0.05] px-2.5 py-2 text-left transition focus-ring',
                    'hover:border-accent-400/25 hover:bg-accent-400/[0.08] data-open:border-accent-400/30 data-open:bg-accent-400/[0.08]',
                    className,
                )}
            >
                <Avatar name={current?.name ?? 'Team'} size="sm" square decorative />
                <span className="min-w-0 flex-1">
                    <span className="sr-only">Switch team. Current team: </span>
                    <span className="block truncate text-sm font-semibold text-slate-100">{current?.name ?? 'No team selected'}</span>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-500" aria-hidden="true">
                        {current?.personal_team ? 'Personal team' : 'Team'}
                    </span>
                </span>
                <ChevronUpDownIcon aria-hidden="true" className="size-4 shrink-0 text-slate-500 group-hover:text-slate-300" />
            </MenuButton>
            <MenuPanel anchor="bottom start" className="w-(--button-width) min-w-64">
                <MenuSection className="max-h-72 overflow-y-auto">
                    <MenuHeading>Switch team</MenuHeading>
                    {teams.map((team) => {
                        const selected = isCurrent(team);

                        return (
                            <MenuItem
                                key={team.id}
                                onClick={() => switchTo(team)}
                                aria-current={selected ? 'true' : undefined}
                                leading={<Avatar name={team.name} size="xs" square decorative tone={selected ? undefined : teamTone(team)} />}
                                trailing={selected && <CheckIcon aria-hidden="true" className="size-4 shrink-0 text-accent-300" />}
                                className={selected ? 'bg-accent-400/[0.07]' : undefined}
                            >
                                {team.name}
                            </MenuItem>
                        );
                    })}
                    {teams.length === 0 && <p className="px-3 py-3 text-sm text-slate-400">No teams yet.</p>}
                </MenuSection>
                <MenuSeparator />
                <MenuItem href="/teams" external icon={Cog6ToothIcon} trailingIcon={ArrowTopRightOnSquareIcon} hint="Opens Nexus">
                    Manage team
                </MenuItem>
            </MenuPanel>
        </Menu>
    );
}

export default TeamSwitcher;
