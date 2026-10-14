<?php

use App\Oauth\NexusUserMapper;

// The OAuth2 client (thetalabs/laravel-oauth2). Nexus is the authorization
// server; register this app as a client there and put its id and secret in
// .env. There are deliberately no defaults for the client credentials.
$base_url = rtrim((string) env('OAUTH_BASEURL', env('NEXUS_URL')), '/');

return [
    'base_endpoint' => $base_url !== '' ? $base_url.'/oauth' : null,
    'authorization_endpoint' => null,
    'token_endpoint' => null,
    'response_type' => 'code',

    'client_id' => env('OAUTH_CLIENT_ID'),
    'client_secret' => env('OAUTH_CLIENT_SECRET'),

    'scopes' => ['*'],

    'redirect_route' => 'oauth2.callback',

    // Where to land after authentication when no intended URL was stored.
    'home' => '/dashboard',

    'userinfo' => [
        'endpoint' => $base_url.'/api/me',
        'method' => 'GET',
    ],

    // Signing out here also signs out of Nexus. Without Nexus (local dev
    // sign-in) the client shows its own "logged out" page instead.
    'logout_redirect' => $base_url !== '' ? $base_url.'/logout?redirect={:url}' : null,

    // Mirrors the Nexus /api/me payload into the local users/teams tables.
    'user-mapper' => NexusUserMapper::class,
];
