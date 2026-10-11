<?php

namespace App\Modules\Notes\Database\Factories;

use App\Modules\Notes\Models\Note;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Note>
 */
class NoteFactory extends Factory
{
    public function forSession(string $sessionId): static
    {
        return $this->state(fn (): array => ['session_id' => $sessionId]);
    }

    /**
     * @return array{session_id: string, title: string}
     */
    public function definition(): array
    {
        return [
            'session_id' => Str::random(40),
            'title' => fake()->sentence(),
        ];
    }
}
