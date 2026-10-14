<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if ($request->user()) {
            return to_route('dashboard');
        }

        return Inertia::render('Welcome');
    }
}
