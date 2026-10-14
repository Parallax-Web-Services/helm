<?php

namespace App\Support;

use App\Models\Team;
use Illuminate\Http\Request;

/**
 * Which team the app is showing right now. Nexus owns
 * membership and the account's default team; switching here only changes
 * the lens for this session, so the next Nexus sync never fights it.
 */
final class CurrentTeam
{
    public const SESSION_KEY = 'helm.team_id';

    private const REQUEST_KEY = 'helm.current_team';

    public static function resolve(Request $request): ?Team
    {
        if ($request->attributes->has(self::REQUEST_KEY)) {
            return $request->attributes->get(self::REQUEST_KEY);
        }

        $team = self::determine($request);

        $request->attributes->set(self::REQUEST_KEY, $team);

        return $team;
    }

    public static function switch(Request $request, Team $team): void
    {
        $request->session()->put(self::SESSION_KEY, $team->id);
        $request->attributes->set(self::REQUEST_KEY, $team);
    }

    private static function determine(Request $request): ?Team
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        $teams = $user->allTeams();

        if ($teams->isEmpty()) {
            return null;
        }

        $preferred = $request->hasSession() ? $request->session()->get(self::SESSION_KEY) : null;

        return $teams->firstWhere('id', $preferred)
            ?? $teams->firstWhere('id', $user->current_team_id)
            ?? $teams->first();
    }
}
