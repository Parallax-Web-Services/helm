<?php

namespace App\Http\Middleware;

use App\Oauth\NexusUserMapper;
use Closure;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

/**
 * Keeps the local mirror of Nexus users/teams fresh mid-session, so a team
 * created on the Nexus side shows up here without signing out and back in.
 * Once the mirror is older than nexus.sync_interval, the next authenticated
 * request re-pulls /api/me with the OAuth token stashed at login.
 *
 * Must run before HandleInertiaRequests: the shared auth props are built
 * on the way in and need this request's teams, not the next one's.
 *
 * Nexus being unreachable must never take the app down with it:
 * failures skip quietly and the next interval retries.
 */
class SyncNexusTeams
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->shouldSync($request)) {
            $this->sync($request);
        }

        return $next($request);
    }

    protected function shouldSync(Request $request): bool
    {
        $user = $request->user();

        if (! $user || ! $request->hasSession()) {
            return false;
        }

        if (! $request->session()->has('oauth2.tokens.access_token')) {
            return false;
        }

        $threshold = now()->subSeconds((int) config('nexus.sync_interval'));

        if ($user->nexus_synced_at && $user->nexus_synced_at->gt($threshold)) {
            return false;
        }

        // A failed attempt must not retry on every request while Nexus is
        // down; the session remembers the last try, successful or not.
        return $request->session()->get('nexus.sync_attempted_at', 0) <= $threshold->getTimestamp();
    }

    protected function sync(Request $request): void
    {
        $request->session()->put('nexus.sync_attempted_at', now()->getTimestamp());

        try {
            $response = $this->http()
                ->withToken($request->session()->get('oauth2.tokens.access_token'))
                ->acceptJson()
                ->timeout(5)
                ->get(config('oauth2.userinfo.endpoint'));
        } catch (ConnectionException) {
            return;
        }

        if ($response->unauthorized() || $response->forbidden()) {
            // The token died before the session did; the next login stores
            // a fresh one.
            $request->session()->forget('oauth2.tokens');

            return;
        }

        if (! $response->ok()) {
            return;
        }

        $data = $response->json() ?: [];

        // The token authenticates the signed-in user; anything else in the
        // payload means confusion somewhere. Never write it locally.
        if (($data['id'] ?? null) !== $request->user()->id) {
            return;
        }

        NexusUserMapper::sync($data);

        $request->user()->refresh();
    }

    protected function http()
    {
        return app()->isLocal() ? Http::withoutVerifying() : Http::createPendingRequest();
    }
}
