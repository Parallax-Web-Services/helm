<?php

namespace App\Http\Controllers;

use App\Support\CurrentTeam;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Accounts, teams and billing live in Nexus. These routes give the shell
 * stable local links that hop over to the right Nexus page.
 */
class NexusLinkController extends Controller
{
    public function account(): RedirectResponse
    {
        return $this->to('/user/profile');
    }

    public function billing(): RedirectResponse
    {
        return $this->to('/billing');
    }

    public function teams(Request $request): RedirectResponse
    {
        $team = CurrentTeam::resolve($request);

        return $this->to($team ? '/teams/'.$team->id : '/dashboard');
    }

    protected function to(string $path): RedirectResponse
    {
        $base = rtrim((string) config('nexus.url'), '/');

        if ($base === '') {
            return back()->with('error', 'Accounts, teams and billing are managed in Nexus. Set NEXUS_URL in .env.');
        }

        return redirect()->away($base.$path);
    }
}
