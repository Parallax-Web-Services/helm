<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Guards the Nexus sign-in routes. A fresh checkout has no Nexus yet; send
 * people back to the welcome page with directions instead of redirecting
 * them to an authorization server that does not exist.
 */
class EnsureNexusIsConfigured
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->routeIs('login', 'oauth2.callback') && ! $this->configured()) {
            return redirect('/')->with('error', 'Nexus sign-in is not configured. Set NEXUS_URL, OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET in .env.');
        }

        return $next($request);
    }

    protected function configured(): bool
    {
        return filled(config('nexus.url')) && filled(config('oauth2.client_id')) && filled(config('oauth2.client_secret'));
    }
}
