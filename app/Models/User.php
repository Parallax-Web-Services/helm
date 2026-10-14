<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * A mirror of a Nexus account. Same id as Nexus, no password: nobody signs
 * in here directly. Nexus authenticates and NexusUserMapper writes whole
 * rows from /api/me, so nothing here is user-submitted.
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $guarded = [];

    protected $hidden = [
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'nexus_synced_at' => 'datetime',
        ];
    }

    public function ownedTeams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class)->withPivot('role')->withTimestamps();
    }

    public function currentTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'current_team_id');
    }

    /** Owned and joined teams together, the way Jetstream reports them. */
    public function allTeams(): Collection
    {
        return $this->ownedTeams->merge($this->teams)->sortBy('name')->values();
    }

    public function belongsToTeam(?Team $team): bool
    {
        return $team !== null && $this->allTeams()->contains('id', $team->id);
    }

    public function initials(): string
    {
        return Str::of($this->name)
            ->explode(' ')
            ->map(fn (string $word) => Str::substr($word, 0, 1))
            ->filter()
            ->take(2)
            ->implode('')
            ?: Str::upper(Str::substr($this->email, 0, 1));
    }
}
