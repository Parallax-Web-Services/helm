<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;

class SlipstreamKit extends Command
{
    protected $signature = 'slipstream:kit
        {kit : The kit to copy (notes)}
        {name : A PascalCase module name, such as Ideas}
        {--edition=js : Store notes in the browser (js) or the database (php)}';

    protected $description = 'Copy an editable Notes feature, Inertia page and module provider into your app';

    public function handle(Filesystem $files): int
    {
        $kit = $this->argument('kit');
        $name = $this->argument('name');
        $edition = $this->option('edition');

        if ($kit !== 'notes') {
            $this->error('Unknown kit. Available kits: notes.');

            return self::INVALID;
        }

        if (! in_array($edition, ['js', 'php'], true)) {
            $this->error('Choose --edition=js or --edition=php.');

            return self::INVALID;
        }

        if (! is_string($name) || preg_match('/\A[A-Z][A-Za-z0-9]*\z/', $name) !== 1) {
            $this->error('Use a PascalCase module name containing only letters and numbers, such as Ideas.');

            return self::INVALID;
        }

        if (in_array(strtolower($name), ['app', 'database', 'tests'], true)) {
            $this->error('Choose another module name. App, Database and Tests are reserved PHP namespaces.');

            return self::INVALID;
        }

        $slug = Str::kebab($name);

        foreach ($files->glob($this->laravel->basePath('modules').'/*') as $existing) {
            $directory = basename($existing);

            if (strcasecmp($directory, $slug) === 0 || strcasecmp(str_replace('-', '', $directory), $name) === 0) {
                $this->error("A module named {$name} already exists (module names are case-insensitive).");
                $this->line('No files were written. Choose another module name.');

                return self::FAILURE;
            }
        }

        $table = Str::snake($name).'_notes';
        $replacements = [
            '{{ name }}' => $name,
            '{{ slug }}' => $slug,
            '{{ table }}' => $table,
        ];
        $blueprint = $this->blueprint($name, $slug, $table, $edition);
        $outputs = [];

        foreach ($blueprint as $target => $stub) {
            $path = $this->laravel->basePath($target);

            if ($this->hasConflict($files, $path)) {
                $this->error("Refusing to overwrite or write through an existing file: {$target}");
                $this->line('No files were written. Choose another module name or move the conflicting file.');

                return self::FAILURE;
            }

            $outputs[$path] = str_replace(
                array_keys($replacements),
                array_values($replacements),
                $files->get($this->laravel->basePath('stubs/slipstream/notes/'.$stub)),
            );
        }

        foreach ($outputs as $path => $contents) {
            $files->ensureDirectoryExists(dirname($path));
            $files->put($path, $contents);
            $this->line('Created '.Str::after($path, $this->laravel->basePath().DIRECTORY_SEPARATOR));
        }

        $this->newLine();
        $this->info("{$name} is yours to edit.");
        $this->line('1. Add this mapping to composer.json under autoload.psr-4:');
        $this->line('   "'.$name.'\\\\": "modules/'.$slug.'/src/",');
        $this->line("2. Add {$name}\\Providers\\{$name}ServiceProvider::class to bootstrap/providers.php.");
        $this->line('3. Run composer dump-autoload.');
        $step = 4;

        if ($edition === 'php') {
            $this->line($step++.'. Run php artisan migrate.');
        }

        $this->line($step++.'. Run npm run build.');
        $this->line($step++.'. Run php artisan serve if your application is not already running.');
        $this->line($step.'. Visit /'.$slug.'.'.($edition === 'js' ? ' Notes stay in this browser.' : ''));

        return self::SUCCESS;
    }

    /**
     * @return array<string, string>
     */
    private function blueprint(string $name, string $slug, string $table, string $edition): array
    {
        $module = 'modules/'.$slug;
        $files = [
            $module.'/resources/js/NotesApp.jsx' => 'NotesApp.jsx.stub',
            $module.'/resources/js/Pages/'.$name.'.jsx' => $edition.'/page.jsx.stub',
            $module.'/src/Providers/'.$name.'ServiceProvider.php' => $edition.'/provider.php.stub',
            $module.'/routes/web.php' => $edition.'/routes.php.stub',
        ];

        if ($edition === 'js') {
            $files[$module.'/resources/js/browser.js'] = 'js/browser.js.stub';
        } else {
            $files[$module.'/src/Models/Note.php'] = 'php/model.php.stub';
            $files[$module.'/src/Notes.php'] = 'php/service.php.stub';
            $files[$module.'/src/Http/Requests/StoreNoteRequest.php'] = 'php/request.php.stub';
            $files[$module.'/src/Http/Controllers/NotesController.php'] = 'php/controller.php.stub';
            $files[$module.'/database/migrations/'.now()->format('Y_m_d_His').'_create_'.$table.'_table.php'] = 'php/migration.php.stub';
        }

        return $files;
    }

    private function hasConflict(Filesystem $files, string $path): bool
    {
        if ($files->exists($path) || is_link($path)) {
            return true;
        }

        for ($directory = dirname($path); $directory !== dirname($directory); $directory = dirname($directory)) {
            if (is_link($directory) || ($files->exists($directory) && ! $files->isDirectory($directory))) {
                return true;
            }
        }

        return false;
    }
}
