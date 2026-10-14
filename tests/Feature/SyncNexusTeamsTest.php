<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SyncNexusTeamsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        config(['oauth2.userinfo.endpoint' => 'https://nexus.test/api/me']);
    }

    public function test_a_stale_mirror_is_refreshed_mid_session(): void
    {
        $user = User::factory()->create(['id' => 42, 'nexus_synced_at' => now()->subHour()]);

        Http::fake(['nexus.test/api/me' => Http::response([
            'id' => 42,
            'name' => $user->name,
            'email' => $user->email,
            'all_teams' => [['id' => 9, 'user_id' => 42, 'name' => 'New on Nexus', 'personal_team' => false, 'users' => []]],
        ])]);

        $this->actingAs($user)
            ->withSession(['oauth2.tokens' => ['access_token' => 'token-1']])
            ->get('/dashboard')
            ->assertOk();

        $this->assertDatabaseHas('teams', ['id' => 9, 'name' => 'New on Nexus']);
        $this->assertTrue($user->fresh()->nexus_synced_at->isAfter(now()->subMinute()));
    }

    public function test_a_payload_for_someone_else_is_never_written(): void
    {
        $user = User::factory()->create(['id' => 42, 'nexus_synced_at' => now()->subHour()]);

        Http::fake(['nexus.test/api/me' => Http::response(['id' => 99, 'name' => 'Someone Else', 'email' => 'else@example.com'])]);

        $this->actingAs($user)
            ->withSession(['oauth2.tokens' => ['access_token' => 'token-1']])
            ->get('/dashboard')
            ->assertOk();

        $this->assertDatabaseMissing('users', ['id' => 99]);
    }

    public function test_nexus_being_down_does_not_take_the_app_down(): void
    {
        $user = User::factory()->create(['nexus_synced_at' => now()->subHour()]);

        Http::fake(['nexus.test/api/me' => Http::response(null, 503)]);

        $this->actingAs($user)
            ->withSession(['oauth2.tokens' => ['access_token' => 'token-1']])
            ->get('/dashboard')
            ->assertOk();
    }
}
