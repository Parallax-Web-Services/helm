<?php

namespace App\Http\Middleware;

use App\Support\CurrentTeam;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Everything the Helm shell needs on every page: who is signed in,
     * which team is in view, and where Nexus lives for account links.
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'app' => [
                'name' => config('app.name'),
                'url' => config('app.url'),
                'env' => app()->environment(),
            ],
            'nexus' => [
                'url' => config('nexus.url') ?: null,
            ],
            'auth' => fn () => $this->auth($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'devLogin' => app()->isLocal(),
        ];
    }

    protected function auth(Request $request): ?array
    {
        $user = $request->user();

        if (! $user) {
            return null;
        }

        $team = CurrentTeam::resolve($request);

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->profile_photo_url,
                'initials' => $user->initials(),
            ],
            'team' => $team?->only('id', 'name', 'personal_team'),
            'teams' => $user->allTeams()->map(fn ($team) => $team->only('id', 'name', 'personal_team'))->values()->all(),
        ];
    }
}
