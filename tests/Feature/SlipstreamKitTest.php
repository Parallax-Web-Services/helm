<?php

namespace Tests\Feature;

use App\Console\Commands\SlipstreamKit;
use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class SlipstreamKitTest extends TestCase
{
    use LazilyRefreshDatabase;

    private string $workspace;

    private Filesystem $files;

    /** @var list<callable(string): void> */
    private array $autoloaders = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->files = new Filesystem;
        $this->workspace = sys_get_temp_dir().'/zefram-slipstream-'.Str::uuid();
        $this->files->ensureDirectoryExists($this->workspace);
        $this->files->copyDirectory(base_path('stubs/slipstream/notes'), $this->workspace.'/stubs/slipstream/notes');
        $this->travelTo('2026-10-11 12:00:00');
    }

    protected function tearDown(): void
    {
        foreach ($this->autoloaders as $autoload) {
            spl_autoload_unregister($autoload);
        }

        $this->files->deleteDirectory($this->workspace);

        parent::tearDown();
    }

    public function test_the_default_kit_creates_an_editable_browser_feature_and_page(): void
    {
        $command = $this->generate(['kit' => 'notes', 'name' => 'Ideas']);

        $this->assertSame(Command::SUCCESS, $command->getStatusCode());
        $this->assertFileExists($this->workspace.'/resources/js/Modules/Ideas/NotesApp.jsx');
        $this->assertFileExists($this->workspace.'/resources/js/Modules/Ideas/browser.js');
        $this->assertFileExists($this->workspace.'/resources/js/Pages/Ideas.jsx');
        $this->assertFileDoesNotExist($this->workspace.'/bootstrap/providers.php');
        $this->assertDirectoryDoesNotExist($this->workspace.'/app/Modules/Ideas/Database');
        $this->assertStringContainsString('App\\Modules\\Ideas\\IdeasServiceProvider::class', $command->getDisplay());
        $this->assertStringContainsString('Run npm run build.', $command->getDisplay());
        $this->assertStringContainsString('Visit /ideas. Notes stay in this browser.', $command->getDisplay());
        $this->assertStringNotContainsString('Run php artisan migrate.', $command->getDisplay());
        $this->loadModule('Ideas');

        $this->get('/ideas')->assertOk()->assertInertia(fn (Assert $page): Assert => $page->component('Ideas', false));
        $this->post('/ideas/notes', ['title' => 'A browser note'])->assertNotFound();
    }

    public function test_generated_jsx_compiles_and_browser_notes_use_the_module_storage_key(): void
    {
        $this->generate(['kit' => 'notes', 'name' => 'BuildIdeas']);
        $this->generate(['kit' => 'notes', 'name' => 'ServerIdeas', '--edition' => 'php']);
        $process = new Process([
            'node', '--input-type=module', '-e', <<<'JS'
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { transform } from 'sucrase';

const directory = process.argv[1];
for (const file of [
    directory + '/resources/js/Modules/BuildIdeas/NotesApp.jsx',
    directory + '/resources/js/Pages/BuildIdeas.jsx',
    directory + '/resources/js/Modules/ServerIdeas/NotesApp.jsx',
    directory + '/resources/js/Pages/ServerIdeas.jsx',
]) {
    transform(fs.readFileSync(file, 'utf8'), { transforms: ['jsx'] });
}

const runtime = pathToFileURL(process.cwd() + '/packages/zefram-js/src/index.js').href;
const source = fs.readFileSync(directory + '/resources/js/Modules/BuildIdeas/browser.js', 'utf8')
    .replace('../../../../packages/zefram-js/src/index.js', runtime);
const { createBrowserNotes } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const values = new Map();
const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
const service = createBrowserNotes({ storage });
assert.deepEqual(service.all(), []);
const valid = await service.save('  Keep this idea  ');
assert.equal(valid.error, null);
assert.equal(valid.notes[0].title, 'Keep this idea');
assert.ok(values.has('zefram.modules.build-ideas.notes'));
assert.equal(createBrowserNotes({ storage }).all()[0].title, 'Keep this idea');
const invalid = await service.save('   ');
assert.equal(invalid.error, 'Title is required.');
assert.equal(service.all().length, 1);
const independent = createBrowserNotes({ storage, key: 'another.module.notes' });
assert.deepEqual(independent.all(), []);
const blockedRead = createBrowserNotes({ storage: { getItem() { throw new Error('Storage blocked'); }, setItem() {} } });
const readError = await blockedRead.save('An idea');
assert.equal(readError.error, 'Storage blocked');
assert.deepEqual(readError.notes, []);
const blockedWrite = createBrowserNotes({ storage: { getItem: (key) => storage.getItem(key), setItem() { throw new Error('Storage full'); } } });
const existing = blockedWrite.all();
const writeError = await blockedWrite.save('Another idea');
assert.equal(writeError.error, 'Storage full');
assert.deepEqual(writeError.notes, existing);
JS,
            $this->workspace,
        ], base_path());

        $process->run();

        $this->assertSame(0, $process->getExitCode(), $process->getErrorOutput());
    }

    public function test_a_php_kit_registers_its_migration_and_saves_only_the_visitors_notes(): void
    {
        $command = $this->generate(['kit' => 'notes', 'name' => 'ResearchIdeas', '--edition' => 'php']);
        $this->preparePhpModule('ResearchIdeas');
        $sessionId = str_repeat('a', 40);
        $this->withCookie(config('session.cookie'), str_repeat('b', 40));
        $this->post('/research-ideas/notes', ['title' => 'Another visitor'])->assertRedirect('/research-ideas');
        $this->withCookie(config('session.cookie'), $sessionId);

        $response = $this->post('/research-ideas/notes', [
            'title' => '  My research  ',
            'session_id' => str_repeat('c', 40),
        ]);

        $response->assertRedirect('/research-ideas')->assertSessionHasNoErrors();
        $this->assertSame(Command::SUCCESS, $command->getStatusCode());
        $this->assertStringContainsString('Run php artisan migrate.', $command->getDisplay());
        $this->assertDatabaseHas('research_ideas_notes', ['title' => 'My research', 'session_id' => $sessionId]);
        $this->assertDatabaseCount('research_ideas_notes', 2);
        $this->get('/research-ideas')->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('ResearchIdeas', false)
            ->has('notes', 1)
            ->where('notes.0.title', 'My research')
            ->where('notes.0.createdAt', '2026-10-11T12:00:00.000000Z')
            ->missing('notes.0.session_id')
            ->where('storeUrl', route('research-ideas.notes.store'))
        );
    }

    #[DataProvider('invalidTitles')]
    public function test_generated_php_notes_reject_invalid_titles_without_saving(
        string $name,
        string $slug,
        string $table,
        array $payload,
        string $message,
    ): void {
        $this->generate(['kit' => 'notes', 'name' => $name, '--edition' => 'php']);
        $this->preparePhpModule($name);

        $response = $this->from('/'.$slug)->post('/'.$slug.'/notes', $payload);

        $response->assertRedirect('/'.$slug)->assertSessionHasErrors(['title' => $message]);
        $this->assertDatabaseEmpty($table);
    }

    public function test_generated_php_notes_accept_the_200_character_boundary(): void
    {
        $this->generate(['kit' => 'notes', 'name' => 'BoundaryIdeas', '--edition' => 'php']);
        $this->preparePhpModule('BoundaryIdeas');

        $response = $this->post('/boundary-ideas/notes', ['title' => str_repeat('a', 200)]);

        $response->assertRedirect('/boundary-ideas')->assertSessionHasNoErrors();
        $this->assertDatabaseHas('boundary_ideas_notes', ['title' => str_repeat('a', 200)]);
    }

    #[DataProvider('invalidArguments')]
    public function test_invalid_arguments_are_rejected_before_any_files_are_written(array $arguments, string $message): void
    {
        $command = $this->generate($arguments);

        $this->assertSame(Command::INVALID, $command->getStatusCode());
        $this->assertStringContainsString($message, $command->getDisplay());
        $this->assertDirectoryDoesNotExist($this->workspace.'/app');
        $this->assertDirectoryDoesNotExist($this->workspace.'/resources');
    }

    public function test_a_collision_preserves_existing_code_and_writes_nothing_else(): void
    {
        $path = $this->workspace.'/resources/js/Pages/Ideas.jsx';
        $this->files->ensureDirectoryExists(dirname($path));
        $this->files->put($path, 'My hand-written page');

        $command = $this->generate(['kit' => 'notes', 'name' => 'Ideas']);

        $this->assertSame(Command::FAILURE, $command->getStatusCode());
        $this->assertSame('My hand-written page', $this->files->get($path));
        $this->assertDirectoryDoesNotExist($this->workspace.'/resources/js/Modules');
        $this->assertFileDoesNotExist($this->workspace.'/app/Modules/Ideas/IdeasServiceProvider.php');
        $this->assertStringContainsString('No files were written.', $command->getDisplay());
    }

    public function test_module_names_cannot_collide_with_different_capitalization(): void
    {
        $path = $this->workspace.'/app/Modules/Ideas/IdeasServiceProvider.php';
        $this->files->ensureDirectoryExists(dirname($path));
        $this->files->put($path, 'My existing provider');

        $command = $this->generate(['kit' => 'notes', 'name' => 'IDEAS']);

        $this->assertSame(Command::FAILURE, $command->getStatusCode());
        $this->assertSame('My existing provider', $this->files->get($path));
        $this->assertDirectoryDoesNotExist($this->workspace.'/resources');
        $this->assertDirectoryDoesNotExist($this->workspace.'/app/Modules/IDEAS');
        $this->assertStringContainsString('module names are case-insensitive', $command->getDisplay());
    }

    public function test_a_blocked_parent_directory_is_rejected_before_writing(): void
    {
        $this->files->put($this->workspace.'/app', 'An existing file');

        $command = $this->generate(['kit' => 'notes', 'name' => 'Ideas']);

        $this->assertSame(Command::FAILURE, $command->getStatusCode());
        $this->assertSame('An existing file', $this->files->get($this->workspace.'/app'));
        $this->assertDirectoryDoesNotExist($this->workspace.'/resources');
    }

    /**
     * @return array<string, array{string, string, string, array<string, mixed>, string}>
     */
    public static function invalidTitles(): array
    {
        return [
            'missing' => ['MissingIdeas', 'missing-ideas', 'missing_ideas_notes', [], 'Give your note a title.'],
            'blank' => ['BlankIdeas', 'blank-ideas', 'blank_ideas_notes', ['title' => '   '], 'Give your note a title.'],
            'non-text' => ['NontextIdeas', 'nontext-ideas', 'nontext_ideas_notes', ['title' => ['invalid']], 'Your note title must be text.'],
            'too long' => ['LongIdeas', 'long-ideas', 'long_ideas_notes', ['title' => str_repeat('a', 201)], 'Keep your note title to 200 characters or fewer.'],
        ];
    }

    /**
     * @return array<string, array{array<string, string>, string}>
     */
    public static function invalidArguments(): array
    {
        return [
            'unknown kit' => [['kit' => 'chat', 'name' => 'Ideas'], 'Unknown kit.'],
            'unknown edition' => [['kit' => 'notes', 'name' => 'Ideas', '--edition' => 'go'], 'Choose --edition=js or --edition=php.'],
            'traversal' => [['kit' => 'notes', 'name' => '../Ideas'], 'Use a PascalCase module name'],
            'namespace' => [['kit' => 'notes', 'name' => 'App\\Ideas'], 'Use a PascalCase module name'],
            'lowercase' => [['kit' => 'notes', 'name' => 'ideas'], 'Use a PascalCase module name'],
            'code injection' => [['kit' => 'notes', 'name' => "Ideas';exit;"], 'Use a PascalCase module name'],
        ];
    }

    /**
     * @param  array<string, string>  $arguments
     */
    private function generate(array $arguments): CommandTester
    {
        $command = new SlipstreamKit;
        $application = new Application($this->workspace);
        $application->instance('files', $this->files);
        $command->setLaravel($application);
        $tester = new CommandTester($command);
        try {
            $tester->execute($arguments);
        } finally {
            Application::setInstance($this->app);
        }

        return $tester;
    }

    private function preparePhpModule(string $name): void
    {
        DB::select('select 1');
        $this->loadModule($name);
        $path = $this->workspace.'/app/Modules/'.$name.'/Database/Migrations';
        $this->assertContains($path, $this->app['migrator']->paths());
        $migration = require $this->files->glob($path.'/*.php')[0];
        $migration->up();
    }

    private function loadModule(string $name): void
    {
        $prefix = 'App\\Modules\\'.$name.'\\';
        $path = $this->workspace.'/app/Modules/'.$name.'/';
        $autoload = static function (string $class) use ($prefix, $path): void {
            if (str_starts_with($class, $prefix)) {
                require $path.str_replace('\\', '/', substr($class, strlen($prefix))).'.php';
            }
        };
        spl_autoload_register($autoload);
        $this->autoloaders[] = $autoload;
        $this->app->register($prefix.$name.'ServiceProvider');
        $this->app['router']->getRoutes()->refreshNameLookups();
    }
}
