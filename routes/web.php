<?php

use App\Http\Controllers\DocsController;
use App\Http\Controllers\VoyageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [VoyageController::class, 'index'])->name('voyage');

Route::get('/docs/{section?}', [DocsController::class, 'show'])
    ->where('section', 'getting-started|modules|slipstream-kits')
    ->name('docs');
