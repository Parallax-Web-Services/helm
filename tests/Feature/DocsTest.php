<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class DocsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_the_docs_start_with_the_browser_edition_and_getting_started_page(): void
    {
        $response = $this->get(route('docs'));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('Docs', false)
            ->where('section', 'getting-started')
            ->where('edition', 'js')
            ->where('moduleName', 'Ideas')
        );
    }

    #[DataProvider('sections')]
    public function test_each_documentation_page_can_be_opened_directly(string $section): void
    {
        $response = $this->get(route('docs', ['section' => $section]));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('Docs', false)
            ->where('section', $section)
        );
    }

    public function test_the_kit_handoff_keeps_the_selected_name_and_php_edition(): void
    {
        $response = $this->get(route('docs', [
            'section' => 'slipstream-kits',
            'edition' => 'php',
            'name' => 'MyIdeas',
        ]));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->where('section', 'slipstream-kits')
            ->where('edition', 'php')
            ->where('moduleName', 'MyIdeas')
        );
    }

    public function test_an_unknown_documentation_page_returns_404(): void
    {
        $this->get('/docs/not-a-page')->assertNotFound();
    }

    public function test_an_unknown_edition_falls_back_to_the_browser_docs(): void
    {
        $response = $this->get(route('docs', ['edition' => 'go']));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->where('edition', 'js')
        );
    }

    public function test_an_array_name_falls_back_to_the_example_name(): void
    {
        $response = $this->get(route('docs', ['name' => ['unexpected shape']]));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->where('moduleName', 'Ideas')
        );
    }

    public function test_an_invalid_name_remains_editable_in_the_kit_guide(): void
    {
        $response = $this->get(route('docs', [
            'section' => 'slipstream-kits',
            'name' => 'my ideas; echo hello',
        ]));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->where('moduleName', 'my ideas; echo hello')
        );
    }

    /** @return array<string, array{string}> */
    public static function sections(): array
    {
        return [
            'getting started' => ['getting-started'],
            'modules' => ['modules'],
            'kits' => ['slipstream-kits'],
        ];
    }
}
