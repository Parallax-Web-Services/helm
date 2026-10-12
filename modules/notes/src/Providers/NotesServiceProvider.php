<?php

namespace Notes\Providers;

use Illuminate\Support\ServiceProvider;

class NotesServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $modulePath = dirname(__DIR__, 2);

        $this->loadRoutesFrom($modulePath.'/routes/web.php');
        $this->loadMigrationsFrom($modulePath.'/database/migrations');
    }
}
