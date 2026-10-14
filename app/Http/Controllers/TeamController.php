<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Support\CurrentTeam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    /** The team in view and its members, as Nexus last reported them. */
    public function show(Request $request): Response
    {
        $team = CurrentTeam::resolve($request);

        return Inertia::render('Team', [
            'team' => $team?->only('id', 'name', 'personal_team'),
            'members' => $team ? $team->members()->map(fn (array $member) => [
                'id' => $member[0]->id,
                'name' => $member[0]->name,
                'email' => $member[0]->email,
                'avatar' => $member[0]->profile_photo_url,
                'initials' => $member[0]->initials(),
                'role' => $member[1],
            ])->all() : [],
        ]);
    }

    /** Change which team the app is looking at. */
    public function switch(Request $request, Team $team): RedirectResponse
    {
        abort_unless($request->user()->belongsToTeam($team), 403);

        CurrentTeam::switch($request, $team);

        return back();
    }
}
