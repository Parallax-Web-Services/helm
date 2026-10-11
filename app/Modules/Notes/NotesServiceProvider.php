<?php

namespace App\Modules\Notes;

use Illuminate\Support\ServiceProvider;

class NotesServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__.'/routes.php');
    }
}
