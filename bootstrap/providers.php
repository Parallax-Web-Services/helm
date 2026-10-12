<?php

use App\Providers\AppServiceProvider;
use App\Providers\SlipstreamServiceProvider;
use Notes\Providers\NotesServiceProvider;

return [
    AppServiceProvider::class,
    SlipstreamServiceProvider::class,
    NotesServiceProvider::class,
];
