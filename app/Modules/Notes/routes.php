<?php

use App\Modules\Notes\Http\Controllers\NotesController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function (): void {
    Route::get('/notes', [NotesController::class, 'index'])->name('notes.index');
    Route::post('/notes', [NotesController::class, 'storeApi'])->name('notes.store');
    Route::post('/voyage/notes', [NotesController::class, 'store'])->name('voyage.notes.store');
});
