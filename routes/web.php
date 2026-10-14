<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DevLoginController;
use App\Http\Controllers\DocsController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NexusLinkController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\VoyageController;
use Illuminate\Support\Facades\Route;

// Sign-in routes (/login, /logout, /oauth/callback, ...) come from the
// OAuth2 client and are registered in AppServiceProvider.

Route::get('/', [HomeController::class, 'show'])->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'show'])->name('dashboard');
    Route::get('/team', [TeamController::class, 'show'])->name('team');
    Route::put('/team/{team}', [TeamController::class, 'switch'])->name('team.switch');

    // Hops into Nexus, where accounts, teams and billing are managed.
    Route::get('/account', [NexusLinkController::class, 'account'])->name('account');
    Route::get('/billing', [NexusLinkController::class, 'billing'])->name('billing');
    Route::get('/teams', [NexusLinkController::class, 'teams'])->name('teams');
});

Route::get('/voyage', [VoyageController::class, 'index'])->name('voyage');

Route::get('/docs/{section?}', [DocsController::class, 'show'])
    ->where('section', 'getting-started|modules|slipstream-kits')
    ->name('docs');

if (app()->isLocal()) {
    Route::post('/dev/login', DevLoginController::class)->name('dev.login');
}
