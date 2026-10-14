<?php

namespace App\Http\Controllers;

use App\Support\CurrentTeam;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Notes\Models\Note;

class DashboardController extends Controller
{
    public function show(Request $request): Response
    {
        $team = CurrentTeam::resolve($request);

        return Inertia::render('Dashboard', [
            'stats' => [
                'members' => $team ? $team->members()->count() : 0,
                'teams' => $request->user()->allTeams()->count(),
                'notes' => Note::query()->where('session_id', $request->session()->getId())->count(),
            ],
        ]);
    }
}
