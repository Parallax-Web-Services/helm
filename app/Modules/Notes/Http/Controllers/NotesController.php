<?php

namespace App\Modules\Notes\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Notes\Http\Requests\StoreNoteRequest;
use App\Modules\Notes\Notes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotesController extends Controller
{
    public function index(Request $request, Notes $notes): Response
    {
        $edition = $request->query('edition') === 'php' ? 'php' : 'js';

        return Inertia::render('Notes', [
            'edition' => $edition,
            'notes' => $edition === 'php'
                ? $notes->allForSession($request->session()->getId())
                : [],
        ]);
    }

    public function store(StoreNoteRequest $request, Notes $notes): RedirectResponse
    {
        $notes->addForSession($request->session()->getId(), $request->validated('title'));

        return to_route('voyage', ['edition' => 'php']);
    }

    public function storeApi(StoreNoteRequest $request, Notes $notes): JsonResponse|RedirectResponse
    {
        $sessionId = $request->session()->getId();
        $notes->addForSession($sessionId, $request->validated('title'));

        if ($request->header('X-Inertia') === 'true' || ! $request->expectsJson()) {
            return to_route('notes.index', ['edition' => 'php']);
        }

        return response()->json([
            'notes' => $notes->allForSession($sessionId),
        ], 201);
    }
}
