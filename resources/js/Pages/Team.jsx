import React from 'react';
import { usePage } from '@inertiajs/react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/16/solid';
import { UserGroupIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import HelmLayout from '../Layouts/HelmLayout.jsx';
import { EmptyState } from '../Helm/deck/EmptyState.jsx';
import { Panel } from '../Helm/deck/Panel.jsx';
import { Avatar } from '../Helm/ui/Avatar.jsx';
import { Badge } from '../Helm/ui/Badge.jsx';
import { Button } from '../Helm/ui/Button.jsx';
import { Cell, HeaderCell, Row, Table, TBody, THead } from '../Helm/ui/DataTable.jsx';
import { Subheading } from '../Helm/ui/Heading.jsx';
import { Text } from '../Helm/ui/Text.jsx';

const roleTones = {
    owner: 'accent',
    admin: 'success',
    editor: 'info',
};

function roleLabel(role) {
    const label = role || 'member';

    return label.charAt(0).toUpperCase() + label.slice(1).replace(/[_-]+/g, ' ');
}

function ManageInNexus(props) {
    return (
        <Button href="/teams" external trailingIcon={ArrowTopRightOnSquareIcon} {...props}>
            Manage in Nexus
        </Button>
    );
}

export default function Team({ team = null, members = [] }) {
    const { auth } = usePage().props;

    return (
        <HelmLayout
            title="Team"
            heading={team?.name ?? 'Team'}
            eyebrow={team ? (team.personal_team ? 'Personal team' : 'Team') : 'Crew'}
            description="Members, roles and invitations live in Nexus, so every app in your suite sees the same crew."
            breadcrumbs={[{ label: 'Team' }]}
            actions={team && <ManageInNexus />}
        >
            {!team ? (
                <EmptyState
                    icon={UserGroupIcon}
                    title="You're not on a team yet"
                    description="Create or join a team in Nexus and it will show up here, and in every other app in your suite."
                    action={<ManageInNexus />}
                />
            ) : members.length === 0 ? (
                <EmptyState
                    icon={UserPlusIcon}
                    title="No crew aboard"
                    description="Invite people to this team in Nexus. They will appear here once they accept."
                    action={<ManageInNexus variant="outline" />}
                />
            ) : (
                <Panel padded={false} grid={false} className="p-4 sm:p-6">
                    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                        <Subheading>Crew manifest</Subheading>
                        <Text size="xs" tone="subtle">{members.length} {members.length === 1 ? 'member' : 'members'}</Text>
                    </div>
                    <Table label={`Members of ${team.name}`} minWidth="34rem">
                        <THead>
                            <HeaderCell>Member</HeaderCell>
                            <HeaderCell>Email</HeaderCell>
                            <HeaderCell align="right">Role</HeaderCell>
                        </THead>
                        <TBody>
                            {members.map((member) => (
                                <Row key={member.id}>
                                    <Cell>
                                        <div className="flex items-center gap-3">
                                            <Avatar src={member.avatar} name={member.name} initials={member.initials} size="md" square decorative />
                                            <span className="min-w-0">
                                                <span className="block truncate font-semibold text-white">{member.name}</span>
                                                {String(member.id) === String(auth?.user?.id) && (
                                                    <span className="text-xs text-slate-500">You</span>
                                                )}
                                            </span>
                                        </div>
                                    </Cell>
                                    <Cell>
                                        <a href={`mailto:${member.email}`} className="rounded text-slate-400 transition hover:text-accent-200 focus-ring">
                                            {member.email}
                                        </a>
                                    </Cell>
                                    <Cell align="right">
                                        <Badge tone={roleTones[member.role] ?? 'neutral'} dot={member.role === 'owner'}>{roleLabel(member.role)}</Badge>
                                    </Cell>
                                </Row>
                            ))}
                        </TBody>
                    </Table>
                </Panel>
            )}
        </HelmLayout>
    );
}
