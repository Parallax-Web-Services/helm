<?php

namespace Tests\Feature;

use App\Oauth\NexusUserMapper;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NexusUserMapperTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_nexus_payload_is_mirrored_and_memberships_are_pruned(): void
    {
        $user = NexusUserMapper::sync($this->payload(teams: [
            $this->team(10, owner: 501, name: 'Personal', personal: true),
            $this->team(20, owner: 900, name: 'Acme', members: [
                ['id' => 501, 'name' => 'Ada Okafor', 'email' => 'ada@example.com', 'role' => 'admin'],
                ['id' => 777, 'name' => 'Lin Moreau', 'email' => 'lin@example.com', 'role' => 'editor'],
            ]),
        ]));

        $this->assertSame(501, $user->id);
        $this->assertSame('ada@example.com', $user->email);
        $this->assertSame(10, $user->current_team_id);
        $this->assertNotNull($user->nexus_synced_at);

        $this->assertDatabaseHas('teams', ['id' => 10, 'user_id' => 501, 'personal_team' => true]);
        $this->assertDatabaseHas('teams', ['id' => 20, 'name' => 'Acme']);
        $this->assertDatabaseHas('users', ['id' => 777, 'email' => 'lin@example.com']);
        $this->assertDatabaseHas('team_user', ['team_id' => 20, 'user_id' => 501, 'role' => 'admin']);
        $this->assertDatabaseHas('team_user', ['team_id' => 20, 'user_id' => 777, 'role' => 'editor']);

        $this->assertEqualsCanonicalizing([10, 20], $user->allTeams()->pluck('id')->all());

        // Nexus stops reporting Lin on the team, and the user's own
        // membership of it: both disappear here on the next sync.
        NexusUserMapper::sync($this->payload(teams: [
            $this->team(10, owner: 501, name: 'Personal', personal: true),
        ]));

        $this->assertDatabaseMissing('team_user', ['team_id' => 20, 'user_id' => 501]);
        $this->assertSame([10], $user->fresh()->allTeams()->pluck('id')->all());
    }

    public function test_a_team_owner_reported_by_nexus_gets_a_local_row(): void
    {
        $team = $this->team(20, owner: 900, name: 'Acme', members: [
            ['id' => 501, 'name' => 'Ada Okafor', 'email' => 'ada@example.com', 'role' => 'editor'],
        ]);
        $team['owner'] = ['id' => 900, 'name' => 'Sam Rivera', 'email' => 'sam@example.com', 'stripe_id' => 'cus_1'];

        $user = NexusUserMapper::sync($this->payload(teams: [$team]));

        $this->assertDatabaseHas('users', ['id' => 900, 'name' => 'Sam Rivera', 'email' => 'sam@example.com']);
        $this->assertSame('Sam Rivera', $user->allTeams()->first()->owner->name);
        $this->assertSame(['Sam Rivera', 'owner'], [
            $user->allTeams()->first()->members()->first()[0]->name,
            $user->allTeams()->first()->members()->first()[1],
        ]);
    }

    public function test_a_payload_without_an_id_is_ignored(): void
    {
        $this->assertNull(NexusUserMapper::sync(['email' => 'nobody@example.com']));
        $this->assertDatabaseCount('users', 0);
    }

    private function payload(array $teams): array
    {
        return [
            'id' => 501,
            'name' => 'Ada Okafor',
            'email' => 'ada@example.com',
            'email_verified_at' => '2026-01-01T00:00:00Z',
            'current_team_id' => 10,
            'profile_photo_url' => 'https://nexus.test/storage/photos/ada.jpg',
            'all_teams' => $teams,
        ];
    }

    private function team(int $id, int $owner, string $name, bool $personal = false, array $members = []): array
    {
        return [
            'id' => $id,
            'user_id' => $owner,
            'name' => $name,
            'personal_team' => $personal,
            'users' => array_map(fn (array $member) => [
                'id' => $member['id'],
                'name' => $member['name'],
                'email' => $member['email'],
                'membership' => [
                    'team_id' => $id,
                    'user_id' => $member['id'],
                    'role' => $member['role'],
                    'created_at' => '2026-01-01T00:00:00Z',
                    'updated_at' => '2026-01-01T00:00:00Z',
                ],
            ], $members),
        ];
    }
}
