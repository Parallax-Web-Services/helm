<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Notes\Notes;

class VoyageController extends Controller
{
    public function index(Request $request, Notes $notes): Response
    {
        $edition = $request->query('edition') === 'php' ? 'php' : 'js';

        return Inertia::render('Voyage', [
            'edition' => $edition,
            'notes' => $edition === 'php'
                ? $notes->allForSession($request->session()->getId())
                : [],
        ]);
    }
}
