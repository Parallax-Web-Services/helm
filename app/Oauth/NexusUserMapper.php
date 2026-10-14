<?php

namespace App\Oauth;

use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

/**
 * Mirrors a Nexus /api/me payload into the local users/teams tables. Runs
 * at login (map) and again mid-session whenever the mirror goes stale
 * (SyncNexusTeams). The payload is authoritative: memberships Nexus no
 * longer reports are removed here too.
 */
class NexusUserMapper
{
    public static function map(Response $response): ?User
    {
        return static::sync($response->json() ?: []);
    }

    public static function sync(array $data): ?User
    {
        if (empty($data['id'])) {
            return null;
        }

        $user = User::query()->updateOrCreate(
            ['id' => $data['id']],
            Arr::only($data, ['name', 'email', 'email_verified_at', 'current_team_id', 'profile_photo_url'])
                + ['nexus_synced_at' => now()],
        );

        static::syncTeams($data);

        return $user->refresh();
    }

    protected static function syncTeams(array $data): void
    {
        $teamIds = [];

        foreach ($data['all_teams'] ?? [] as $teamData) {
            if (empty($teamData['id'])) {
                continue;
            }

            $teamIds[] = $teamData['id'];

            Team::query()->updateOrCreate(
                ['id' => $teamData['id']],
                Arr::only($teamData, ['user_id', 'name', 'personal_team']) + ['nexus_synced_at' => now()],
            );

            // Jetstream reports the owner separately from the members; it
            // needs a local row too, or the team page could not list them.
            $owner = $teamData['owner'] ?? null;

            if (! empty($owner['id']) && ! empty($owner['email'])) {
                User::query()->firstOrCreate(
                    ['id' => $owner['id']],
                    Arr::only($owner, ['name', 'email', 'profile_photo_url']) + ['nexus_synced_at' => now()],
                );
            }

            $memberIds = [];

            foreach ($teamData['users'] ?? $teamData['all_users'] ?? [] as $member) {
                $membership = $member['membership'] ?? null;

                if (! $membership || empty($membership['user_id']) || empty($member['email'])) {
                    continue;
                }

                $memberIds[] = $membership['user_id'];

                // Members need a local row for the mirror to join against.
                // They cannot act here until they sign in through Nexus.
                User::query()->firstOrCreate(
                    ['id' => $membership['user_id']],
                    Arr::only($member, ['name', 'email', 'profile_photo_url']) + ['nexus_synced_at' => now()],
                );

                DB::table('team_user')->updateOrInsert(
                    ['team_id' => $teamData['id'], 'user_id' => $membership['user_id']],
                    ['role' => $membership['role'] ?? null, 'updated_at' => now(), 'created_at' => now()],
                );
            }

            // The member list is authoritative for this team.
            DB::table('team_user')
                ->where('team_id', $teamData['id'])
                ->whereNotIn('user_id', $memberIds)
                ->delete();
        }

        // And the team list is authoritative for the syncing user.
        DB::table('team_user')
            ->where('user_id', $data['id'])
            ->whereNotIn('team_id', $teamIds)
            ->delete();
    }
}
