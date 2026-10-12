<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Notes\Models\Note;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class NotesModuleTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->withCredentials();
    }

    public function test_the_notes_page_starts_in_the_browser_edition_without_loading_php_notes(): void
    {
        $sessionId = str_repeat('a', 40);
        $this->withCookie(config('session.cookie'), $sessionId);
        Note::factory()->forSession($sessionId)->create();

        $response = $this->get(route('notes.index'));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('notes/Notes', false)
            ->where('edition', 'js')
            ->where('notes', [])
        );
    }

    public function test_the_php_notes_page_only_loads_the_visitors_saved_notes(): void
    {
        $this->travelTo('2026-10-11 12:00:00');
        $sessionId = str_repeat('a', 40);
        $this->withCookie(config('session.cookie'), $sessionId);
        $note = Note::factory()->forSession($sessionId)->create(['title' => 'My saved idea']);
        Note::factory()->forSession(str_repeat('b', 40))->create(['title' => 'Another visitor']);

        $response = $this->get(route('notes.index', ['edition' => 'php']));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('notes/Notes', false)
            ->where('edition', 'php')
            ->where('notes', [
                ['id' => $note->id, 'title' => 'My saved idea', 'createdAt' => '2026-10-11T12:00:00.000000Z'],
            ])
        );
    }

    public function test_saving_a_note_returns_201_with_only_the_visitors_notes_in_creation_order(): void
    {
        $this->travelTo('2026-10-11 12:00:00');
        $sessionId = str_repeat('a', 40);
        $this->withCookie(config('session.cookie'), $sessionId);
        $existingNote = Note::factory()->forSession($sessionId)->create(['title' => 'Existing idea']);
        Note::factory()->forSession(str_repeat('b', 40))->create(['title' => 'Another visitor']);

        $response = $this->postJson(route('notes.store'), [
            'title' => '  My first idea  ',
            'session_id' => str_repeat('b', 40),
            'id' => $existingNote->id,
        ]);

        $savedNote = Note::query()->where('title', 'My first idea')->sole();
        $response->assertCreated()->assertExactJson([
            'notes' => [
                ['id' => $existingNote->id, 'title' => 'Existing idea', 'createdAt' => '2026-10-11T12:00:00.000000Z'],
                ['id' => $savedNote->id, 'title' => 'My first idea', 'createdAt' => '2026-10-11T12:00:00.000000Z'],
            ],
        ]);
        $this->assertDatabaseHas('notes', ['id' => $savedNote->id, 'session_id' => $sessionId]);
        $this->assertDatabaseHas('notes', ['id' => $existingNote->id, 'title' => 'Existing idea']);
        $this->assertDatabaseCount('notes', 3);
    }

    public function test_separate_browser_sessions_keep_their_saved_notes_private(): void
    {
        $firstSessionId = str_repeat('a', 40);
        $secondSessionId = str_repeat('b', 40);
        $this->withCookie(config('session.cookie'), $firstSessionId)
            ->postJson(route('notes.store'), ['title' => 'First visitor'])
            ->assertCreated();

        $response = $this->withCookie(config('session.cookie'), $secondSessionId)
            ->postJson(route('notes.store'), ['title' => 'Second visitor']);

        $response->assertCreated()
            ->assertJsonCount(1, 'notes')
            ->assertJsonPath('notes.0.title', 'Second visitor');
        $this->assertDatabaseHas('notes', ['session_id' => $firstSessionId, 'title' => 'First visitor']);
        $this->assertDatabaseHas('notes', ['session_id' => $secondSessionId, 'title' => 'Second visitor']);
    }

    public function test_invalid_json_notes_return_422_with_a_helpful_error_without_saving(): void
    {
        $response = $this->postJson(route('notes.store'), ['title' => '   ']);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title' => 'Give your note a title.']);
        $this->assertDatabaseEmpty('notes');
    }

    #[DataProvider('browserHeaders')]
    public function test_browser_note_submissions_redirect_to_the_php_notes_page(array $headers): void
    {
        $sessionId = str_repeat('a', 40);
        $this->withCookie(config('session.cookie'), $sessionId);

        $response = $this->post(route('notes.store'), ['title' => 'A browser idea'], $headers);

        $response->assertRedirectToRoute('notes.index', ['edition' => 'php'])
            ->assertSessionHasNoErrors();
        $this->assertDatabaseHas('notes', ['session_id' => $sessionId, 'title' => 'A browser idea']);
    }

    /**
     * @return array<string, array{array<string, string>}>
     */
    public static function browserHeaders(): array
    {
        return [
            'browser form' => [[]],
            'Inertia request' => [['X-Inertia' => 'true', 'Accept' => 'application/json']],
        ];
    }
}
