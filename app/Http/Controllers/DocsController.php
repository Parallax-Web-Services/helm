<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocsController extends Controller
{
    public function show(Request $request, string $section = 'getting-started'): Response
    {
        $moduleName = $request->query('name', 'Ideas');

        return Inertia::render('Docs', [
            'section' => $section,
            'edition' => $request->query('edition') === 'php' ? 'php' : 'js',
            'moduleName' => is_string($moduleName) ? $moduleName : 'Ideas',
        ]);
    }
}
