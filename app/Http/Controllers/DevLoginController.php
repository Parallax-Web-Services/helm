<?php

namespace App\Http\Controllers;

use App\Support\DemoAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Local development only. The route is registered solely in the local
 * environment, so a fresh checkout can be explored without a running Nexus.
 */
class DevLoginController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        abort_unless(app()->isLocal(), 404);

        Auth::login(DemoAccount::ensure());

        $request->session()->regenerate();

        return to_route('dashboard');
    }
}
