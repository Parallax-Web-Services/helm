<?php

namespace Database\Seeders;

use App\Support\DemoAccount;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Real accounts arrive from Nexus at sign-in. This is a local demo.
        DemoAccount::ensure();
    }
}
