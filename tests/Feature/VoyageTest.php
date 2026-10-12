<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Notes\Models\Note;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class VoyageTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_the_voyage_starts_in_the_browser_edition(): void
    {
        $response = $this->get(route('voyage'));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('Voyage', false)
            ->where('edition', 'js')
            ->where('notes', [])
        );
    }

    public function test_an_unknown_edition_falls_back_to_the_browser_edition(): void
    {
        $response = $this->get(route('voyage', ['edition' => 'go']));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->where('edition', 'js')
            ->where('notes', [])
        );
    }

    public function test_php_notes_only_include_the_current_visitors_notes_in_creation_order(): void
    {
        $this->travelTo('2026-10-11 12:00:00');
        $sessionId = str_repeat('a', 40);
        $this->withCookie(config('session.cookie'), $sessionId);
        $firstNote = Note::factory()->create(['session_id' => $sessionId, 'title' => 'First discovery']);
        $secondNote = Note::factory()->create(['session_id' => $sessionId, 'title' => 'Second discovery']);
        Note::factory()->create(['session_id' => str_repeat('b', 40), 'title' => 'Another visitor']);

        $response = $this->get(route('voyage', ['edition' => 'php']));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->where('edition', 'php')
            ->where('notes', [
                ['id' => $firstNote->id, 'title' => 'First discovery', 'createdAt' => '2026-10-11T12:00:00.000000Z'],
                ['id' => $secondNote->id, 'title' => 'Second discovery', 'createdAt' => '2026-10-11T12:00:00.000000Z'],
            ])
        );
    }

    public function test_the_browser_edition_does_not_load_php_notes(): void
    {
        $sessionId = str_repeat('a', 40);
        $this->withCookie(config('session.cookie'), $sessionId);
        Note::factory()->create(['session_id' => $sessionId]);

        $response = $this->get(route('voyage', ['edition' => 'js']));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->where('edition', 'js')
            ->where('notes', [])
        );
    }

    public function test_a_note_is_trimmed_and_saved_for_the_current_visitor(): void
    {
        $sessionId = str_repeat('a', 40);
        $this->withCookie(config('session.cookie'), $sessionId);

        $response = $this->post(route('voyage.notes.store'), [
            'title' => '  My maiden voyage  ',
            'session_id' => str_repeat('b', 40),
        ]);

        $response->assertRedirectToRoute('voyage', ['edition' => 'php'])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('notes', ['title' => 'My maiden voyage', 'session_id' => $sessionId]);
        $this->assertDatabaseCount('notes', 1);
    }

    public function test_a_note_accepts_a_title_of_exactly_200_characters(): void
    {
        $response = $this->post(route('voyage.notes.store'), ['title' => str_repeat('a', 200)]);

        $response->assertRedirectToRoute('voyage', ['edition' => 'php'])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('notes', ['title' => str_repeat('a', 200)]);
    }

    #[DataProvider('invalidNotes')]
    public function test_invalid_notes_return_a_helpful_error_without_saving(array $payload, string $message): void
    {
        $response = $this->from(route('voyage', ['edition' => 'php']))
            ->post(route('voyage.notes.store'), $payload);

        $response->assertRedirectToRoute('voyage', ['edition' => 'php'])
            ->assertSessionHasErrors(['title' => $message]);
        $this->assertDatabaseEmpty('notes');
    }

    /**
     * @return array<string, array{array<string, mixed>, string}>
     */
    public static function invalidNotes(): array
    {
        return [
            'missing title' => [[], 'Give your note a title.'],
            'empty title' => [['title' => ''], 'Give your note a title.'],
            'whitespace title' => [['title' => '   '], 'Give your note a title.'],
            'non-text title' => [['title' => ['wrong shape']], 'Your note title must be text.'],
            'title over 200 characters' => [['title' => str_repeat('a', 201)], 'Keep your note title to 200 characters or fewer.'],
        ];
    }

    public function test_inertia_navigation_receives_the_same_edition_and_notes_contract(): void
    {
        $initialPage = $this->get(route('voyage', ['edition' => 'php']))->assertOk()->viewData('page');

        $response = $this->get(route('voyage', ['edition' => 'php']), [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => $initialPage['version'],
        ]);

        $response->assertOk()
            ->assertHeader('X-Inertia', 'true')
            ->assertJsonPath('component', 'Voyage')
            ->assertJsonPath('props.edition', 'php')
            ->assertJsonPath('props.notes', []);
    }
}
