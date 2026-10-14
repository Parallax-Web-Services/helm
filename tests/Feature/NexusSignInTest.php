<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NexusSignInTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_guests_see_the_welcome_page(): void
    {
        $this->get('/')->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('Welcome', false)
            ->where('auth', null)
            ->where('nexus.url', null)
        );
    }

    public function test_signed_in_people_go_straight_to_the_dashboard(): void
    {
        $this->actingAs(User::factory()->create())->get('/')->assertRedirect('/dashboard');
    }

    public function test_without_nexus_sign_in_explains_what_to_configure(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');

        $this->get('/login')
            ->assertRedirect('/')
            ->assertSessionHas('error', fn (string $message) => str_contains($message, 'NEXUS_URL'));
    }

    public function test_sign_in_redirects_to_the_nexus_authorization_endpoint(): void
    {
        $this->configureNexus();

        $response = $this->get('/login');

        $response->assertRedirectContains('https://nexus.test/oauth/authorize?');
        $this->assertStringContainsString('client_id=helm-client', $response->headers->get('Location'));
        $this->assertStringContainsString(urlencode('/oauth/callback'), $response->headers->get('Location'));
    }

    public function test_the_callback_signs_in_the_nexus_account_and_mirrors_its_teams(): void
    {
        $this->configureNexus();

        Http::fake([
            'nexus.test/oauth/token' => Http::response(['access_token' => 'token-1', 'expires_in' => 3600]),
            'nexus.test/api/me' => Http::response([
                'id' => 42,
                'name' => 'Ada Okafor',
                'email' => 'ada@example.com',
                'current_team_id' => 7,
                'all_teams' => [['id' => 7, 'user_id' => 42, 'name' => 'Acme', 'personal_team' => false, 'users' => []]],
            ]),
        ]);

        $this->withSession(['_token' => 'state-1'])
            ->get('/oauth/callback?state=state-1&code=code-1')
            ->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs(User::find(42));
        $this->assertDatabaseHas('teams', ['id' => 7, 'name' => 'Acme']);
        $this->assertSame('token-1', session('oauth2.tokens.access_token'));

        Http::assertSent(fn ($request) => $request->url() === 'https://nexus.test/api/me'
            && $request->hasHeader('Authorization', 'Bearer token-1'));
    }

    public function test_a_callback_with_a_forged_state_is_rejected(): void
    {
        $this->configureNexus();

        $this->withSession(['_token' => 'state-1'])
            ->get('/oauth/callback?state=forged&code=code-1')
            ->assertStatus(400);

        $this->assertGuest();
    }

    public function test_signing_out_without_nexus_lands_on_the_logged_out_page(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/logout')
            ->assertRedirect('/logged-out');

        $this->assertGuest();
        $this->get('/logged-out')->assertOk()->assertSee('Logged Out');
    }

    private function configureNexus(): void
    {
        config([
            'nexus.url' => 'https://nexus.test',
            'oauth2.client_id' => 'helm-client',
            'oauth2.client_secret' => 'helm-secret',
            'oauth2.authorization_endpoint' => 'https://nexus.test/oauth/authorize',
            'oauth2.token_endpoint' => 'https://nexus.test/oauth/token',
            'oauth2.userinfo.endpoint' => 'https://nexus.test/api/me',
        ]);
    }
}
