<?php

return [
    /*
     * Where Nexus lives. Account, team and billing links in the shell point
     * here, and the OAuth client (config/oauth2.php) defaults to it too.
     */
    'url' => env('NEXUS_URL'),

    /*
     * How stale (in seconds) the local mirror of Nexus users/teams may get
     * before an authenticated request re-pulls /api/me mid-session. See the
     * SyncNexusTeams middleware.
     */
    'sync_interval' => (int) env('NEXUS_SYNC_INTERVAL', 60),
];
