import React, { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { DocumentTextIcon, Squares2X2Icon, UsersIcon } from '@heroicons/react/20/solid';
import { SignalIcon } from '@heroicons/react/24/outline';
import HelmLayout from '../Layouts/HelmLayout.jsx';
import { brand } from '../helm.config.js';
import { Card } from '../Helm/deck/Card.jsx';
import { EmptyState } from '../Helm/deck/EmptyState.jsx';
import { Panel } from '../Helm/deck/Panel.jsx';
import { Pips } from '../Helm/deck/Pips.jsx';
import { Stat } from '../Helm/deck/Stat.jsx';
import { Steps } from '../Helm/deck/Steps.jsx';
import { Button } from '../Helm/ui/Button.jsx';
import { Heading, Subheading } from '../Helm/ui/Heading.jsx';
import { Code, Text } from '../Helm/ui/Text.jsx';

function greetingFor(hour) {
    if (hour < 5) return 'Still up';
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';

    return 'Good evening';
}

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

export default function Dashboard({ stats = {} }) {
    const { auth, nexus } = usePage().props;
    const greeting = useMemo(() => greetingFor(new Date().getHours()), []);
    const firstName = auth?.user?.name?.split(/\s+/)[0];
    const members = stats.members ?? 0;
    const teams = stats.teams ?? 0;
    const notes = stats.notes ?? 0;

    const steps = [
        {
            title: 'Connect Nexus',
            description: <>Point <Code>NEXUS_URL</Code> and your OAuth client in <Code>.env</Code> at your Nexus server.</>,
            done: Boolean(nexus?.url),
            action: { label: 'Read the guide', href: '/docs' },
        },
        {
            title: 'Make it yours',
            description: <>Set your name, mark, accent and navigation in <Code>resources/js/helm.config.js</Code>.</>,
            done: brand.name !== 'Helm',
        },
        {
            title: 'Add a module',
            description: <>Run <Code>slipstream kit notes Ideas --edition=php</Code>, then add it to the navigation.</>,
            action: { label: 'Slipstream kits', href: '/docs/slipstream-kits' },
        },
        {
            title: 'Invite your team',
            description: 'Teams and invitations live in Nexus, so every app in your suite sees the same crew.',
            done: members > 1,
            action: { label: 'Open Nexus', href: '/teams', external: true },
        },
    ];
    const completed = steps.filter((step) => step.done).length;

    return (
        <HelmLayout
            title="Bridge"
            heading={firstName ? `${greeting}, ${firstName}` : greeting}
            eyebrow={auth?.team?.name ?? 'Bridge'}
            description="Your command deck at a glance. Everything here is wired to real data, so swap it for your own."
        >
            <div className="grid gap-6">
                <section aria-label="Readouts" className="grid gap-3 sm:grid-cols-3">
                    <Stat label="Crew" value={members} hint={auth?.team ? `On ${auth.team.name}` : 'No team selected'} icon={UsersIcon} />
                    <Stat label="Teams" value={teams} hint="Synced from Nexus" icon={Squares2X2Icon} />
                    <Stat label="Notes" value={notes} hint="In the Notes module" icon={DocumentTextIcon} />
                </section>

                <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
                    <Panel aria-labelledby="bearings-title">
                        <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <Subheading id="bearings-title" className="text-accent-200/85">Get your bearings</Subheading>
                                <Heading level={2} className="mt-2">Four steps to your own deck</Heading>
                            </div>
                            <span className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                                <Pips total={steps.length} filled={completed} />
                                <span aria-hidden="true">{completed}/{steps.length}</span>
                            </span>
                        </div>
                        <Steps steps={steps} label="Getting started" />
                    </Panel>

                    <Card className="flex flex-col">
                        <Subheading>Transmissions</Subheading>
                        <Text className="mt-1">{plural(notes, 'note')} logged so far.</Text>
                        <EmptyState
                            className="mt-5 flex-1 justify-center"
                            icon={SignalIcon}
                            title="No transmissions yet"
                            description="This is an EmptyState. Point it at your first module's activity feed."
                            action={<Button href="/notes" variant="outline" size="sm">Open Notes</Button>}
                        />
                    </Card>
                </div>
            </div>
        </HelmLayout>
    );
}
