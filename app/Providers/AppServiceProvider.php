<?php

namespace App\Providers;

use App\Http\Middleware\EnsureNexusIsConfigured;
use Illuminate\Support\ServiceProvider;
use ThetaLabs\Oauth\Oauth;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // /login, /logout, /oauth/callback, /timeout, /logged-out: sign-in
        // through Nexus, the same way every app in a Helm suite does it.
        Oauth::routes(['middleware' => ['web', EnsureNexusIsConfigured::class]]);
    }
}
