<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TeamTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_the_team_page_lists_the_owner_and_members_with_their_roles(): void
    {
        $owner = User::factory()->create(['name' => 'Ada Okafor']);
        $team = Team::factory()->for($owner, 'owner')->create(['name' => 'Acme']);
        $team->users()->attach(User::factory()->create(['name' => 'Lin Moreau']), ['role' => 'editor']);
        $owner->forceFill(['current_team_id' => $team->id])->save();

        $this->actingAs($owner)->get('/team')->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('Team', false)
            ->where('team.name', 'Acme')
            ->has('members', 2)
            ->where('members.0.name', 'Ada Okafor')
            ->where('members.0.role', 'owner')
            ->where('members.1.name', 'Lin Moreau')
            ->where('members.1.role', 'editor')
        );
    }

    public function test_the_shell_shares_the_signed_in_account_and_its_teams(): void
    {
        $user = User::factory()->create(['name' => 'Ada Okafor']);
        $personal = Team::factory()->personal()->for($user, 'owner')->create(['name' => 'Ada']);
        $joined = Team::factory()->create(['name' => 'Acme']);
        $joined->users()->attach($user, ['role' => 'admin']);
        $user->forceFill(['current_team_id' => $personal->id])->save();

        $this->actingAs($user)->get('/dashboard')->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('Dashboard', false)
            ->where('auth.user.initials', 'AO')
            ->where('auth.team.id', $personal->id)
            ->has('auth.teams', 2)
            ->where('stats.teams', 2)
            ->where('stats.members', 1)
        );
    }

    public function test_switching_changes_the_team_in_view(): void
    {
        $user = User::factory()->create();
        $personal = Team::factory()->personal()->for($user, 'owner')->create();
        $joined = Team::factory()->create(['name' => 'Acme']);
        $joined->users()->attach($user, ['role' => 'editor']);
        $user->forceFill(['current_team_id' => $personal->id])->save();

        $this->actingAs($user)->from('/team')->put('/team/'.$joined->id)->assertRedirect('/team');

        $this->get('/team')->assertInertia(fn (Assert $page): Assert => $page->where('team.name', 'Acme'));
    }

    public function test_people_cannot_switch_to_a_team_they_do_not_belong_to(): void
    {
        $user = User::factory()->create();
        $stranger = Team::factory()->create();

        $this->actingAs($user)->put('/team/'.$stranger->id)->assertForbidden();
    }

    public function test_account_links_hop_to_nexus(): void
    {
        config(['nexus.url' => 'https://nexus.test']);

        $user = User::factory()->create();
        $team = Team::factory()->for($user, 'owner')->create();
        $user->forceFill(['current_team_id' => $team->id])->save();

        $this->actingAs($user);

        $this->get('/account')->assertRedirect('https://nexus.test/user/profile');
        $this->get('/billing')->assertRedirect('https://nexus.test/billing');
        $this->get('/teams')->assertRedirect('https://nexus.test/teams/'.$team->id);
    }

    public function test_account_links_explain_themselves_without_nexus(): void
    {
        $this->actingAs(User::factory()->create())
            ->from('/dashboard')
            ->get('/account')
            ->assertRedirect('/dashboard')
            ->assertSessionHas('error');
    }
}
