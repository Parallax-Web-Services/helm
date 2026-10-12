<?php

namespace Tests\Feature;

use App\Providers\SlipstreamServiceProvider;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Laravel\Mcp\Server\Registrar;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class SlipstreamCliTest extends TestCase
{
    public function test_the_launcher_loads_this_project_when_called_from_another_directory(): void
    {
        $process = $this->runCli(['kit', '--help'], sys_get_temp_dir());

        $this->assertSame(0, $process->getExitCode(), $process->getErrorOutput());
        $this->assertStringContainsString('editable Notes', $process->getOutput());
        $this->assertStringContainsString('--edition', $process->getOutput());
    }

    public function test_the_launcher_exposes_help_without_executing_a_command(): void
    {
        $process = $this->runCli(['--help']);

        $this->assertSame(0, $process->getExitCode(), $process->getErrorOutput());
        $this->assertStringContainsString('Usage:', $process->getOutput());
    }

    public function test_unknown_commands_keep_a_failure_exit_code(): void
    {
        $process = $this->runCli(['unknown-zefram-command', '--no-interaction']);

        $this->assertSame(1, $process->getExitCode());
        $this->assertStringContainsString('unknown-zefram-command', $process->getOutput().$process->getErrorOutput());
    }

    public function test_missing_kit_arguments_fail_without_prompting(): void
    {
        $process = $this->runCli(['kit', 'notes', '--no-interaction']);

        $this->assertSame(1, $process->getExitCode());
        $this->assertStringContainsString('name', $process->getOutput().$process->getErrorOutput());
    }

    public function test_invalid_kit_arguments_preserve_the_validation_exit_code(): void
    {
        $process = $this->runCli(['kit', 'unknown', 'CliTestIdeas', '--no-interaction']);

        $this->assertSame(2, $process->getExitCode());
        $this->assertStringContainsString('Unknown kit.', $process->getOutput());
        $this->assertDirectoryDoesNotExist(base_path('modules/cli-test-ideas'));
    }

    public function test_the_launcher_explains_missing_dependencies_without_a_php_fatal_error(): void
    {
        $files = new Filesystem;
        $workspace = sys_get_temp_dir().'/zefram-cli-'.bin2hex(random_bytes(8));
        $files->ensureDirectoryExists($workspace);
        $files->copy(base_path('slipstream'), $workspace.'/slipstream');

        try {
            $process = new Process([PHP_BINARY, $workspace.'/slipstream', '--help'], $workspace);
            $process->run();

            $this->assertSame(1, $process->getExitCode());
            $this->assertStringContainsString('Run composer install', $process->getErrorOutput());
            $this->assertStringNotContainsString('Fatal error', $process->getErrorOutput());
        } finally {
            $files->deleteDirectory($workspace);
        }
    }

    public function test_package_commands_and_mcp_register_without_sending_http_requests(): void
    {
        Http::preventStrayRequests();

        $provider = new SlipstreamServiceProvider($this->app);
        $provider->register();
        $provider->boot();
        $commands = Artisan::all();

        $this->assertArrayHasKey('worker', $commands);
        $this->assertArrayHasKey('agent', $commands);
        $this->assertArrayHasKey('sync', $commands);
        $this->assertArrayHasKey('mcp', $commands);
        $this->assertArrayHasKey('drive:install', $commands);
        $this->assertNotNull($this->app->make(Registrar::class)->getLocalServer('slipstream'));
        $this->assertIsArray(config('slipstream-agent.profiles'));
        Http::assertNothingSent();
    }

    public function test_standard_artisan_commands_keep_their_laravel_implementation(): void
    {
        $process = new Process([PHP_BINARY, base_path('artisan'), 'make:migration', '--help'], base_path());
        $process->run();

        $this->assertSame(0, $process->getExitCode(), $process->getErrorOutput());
        $this->assertStringContainsString('Create a new migration file', $process->getOutput());
    }

    /**
     * @param  list<string>  $arguments
     */
    private function runCli(array $arguments, ?string $directory = null): Process
    {
        $process = new Process([PHP_BINARY, base_path('slipstream'), ...$arguments], $directory ?? base_path());
        $process->setTimeout(15);
        $process->run();

        return $process;
    }
}
