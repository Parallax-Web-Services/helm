<?php

namespace App\Providers;

use Composer\InstalledVersions;
use Illuminate\Support\ServiceProvider;
use Laravel\Mcp\Facades\Mcp;
use Slipstream\Console\Commands\AgentRun;
use Slipstream\Console\Commands\DriveDoctor;
use Slipstream\Console\Commands\DriveInstall;
use Slipstream\Console\Commands\DriveRegister;
use Slipstream\Console\Commands\DriveStatus;
use Slipstream\Console\Commands\DriveWork;
use Slipstream\Console\Commands\McpServe;
use Slipstream\Console\Commands\SyncAgentActivity;
use Slipstream\Console\Commands\WorkerRun;
use Slipstream\Mcp\SlipstreamServer;

class SlipstreamServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $packagePath = InstalledVersions::getInstallPath('parallax/cli');

        $this->mergeConfigFrom($packagePath.'/config/parallax.php', 'parallax');
        $this->mergeConfigFrom($packagePath.'/config/slipstream-agent.php', 'slipstream-agent');
    }

    public function boot(): void
    {
        if (! $this->app->runningInConsole()) {
            return;
        }

        $this->commands([
            WorkerRun::class,
            AgentRun::class,
            SyncAgentActivity::class,
            McpServe::class,
            DriveInstall::class,
            DriveRegister::class,
            DriveStatus::class,
            DriveDoctor::class,
            DriveWork::class,
        ]);

        Mcp::local('slipstream', SlipstreamServer::class);
    }
}
