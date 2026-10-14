<?php

namespace Tests\Feature;

use App\Http\Controllers\DevLoginController;
use App\Support\DemoAccount;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class DevLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_dev_sign_in_does_not_exist_outside_local(): void
    {
        $this->post('/dev/login')->assertNotFound();
        $this->assertGuest();
    }

    public function test_locally_it_signs_in_the_demo_account_with_its_crew(): void
    {
        $this->app['env'] = 'local';
        Route::post('/dev/login', DevLoginController::class)->middleware('web');

        // Outside the testing environment CSRF applies, so a drive-by POST
        // from another site cannot sign a browser in.
        $this->post('/dev/login')->assertStatus(419);

        $this->withSession(['_token' => 'token-1'])
            ->post('/dev/login', ['_token' => 'token-1'])
            ->assertRedirect('/dashboard');

        $user = auth()->user();
        $this->assertSame(DemoAccount::EMAIL, $user->email);
        $this->assertSame('Bridge Crew', $user->currentTeam->name);
        $this->assertCount(4, $user->currentTeam->members());
    }

    public function test_the_demo_account_is_only_created_once(): void
    {
        DemoAccount::ensure();
        DemoAccount::ensure();

        $this->assertDatabaseCount('teams', 2);
        $this->assertDatabaseCount('users', 4);
    }
}
