<?php

namespace App\Support;

use App\Models\Team;
use App\Models\User;

/**
 * A local account with a small crew, so a fresh checkout can be explored
 * without a running Nexus. Used by the dev sign-in and the seeder only.
 */
final class DemoAccount
{
    public const EMAIL = 'demo@example.com';

    private const CREW = [
        ['name' => 'Ada Okafor', 'email' => 'ada@example.com', 'role' => 'admin'],
        ['name' => 'Lin Moreau', 'email' => 'lin@example.com', 'role' => 'editor'],
        ['name' => 'Sam Rivera', 'email' => 'sam@example.com', 'role' => 'editor'],
    ];

    public static function ensure(): User
    {
        $user = User::query()->firstOrCreate(
            ['email' => self::EMAIL],
            ['name' => 'Demo Operator', 'email_verified_at' => now()],
        );

        if ($user->ownedTeams()->doesntExist()) {
            Team::query()->create(['user_id' => $user->id, 'name' => 'Demo Operator', 'personal_team' => true]);

            $crew = Team::query()->create(['user_id' => $user->id, 'name' => 'Bridge Crew', 'personal_team' => false]);

            foreach (self::CREW as $member) {
                $mate = User::query()->firstOrCreate(
                    ['email' => $member['email']],
                    ['name' => $member['name'], 'email_verified_at' => now()],
                );

                $crew->users()->syncWithoutDetaching([$mate->id => ['role' => $member['role']]]);
            }

            $user->forceFill(['current_team_id' => $crew->id])->save();
        }

        return $user->refresh();
    }
}
