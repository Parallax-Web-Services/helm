<?php

namespace App\Models;

use Database\Factories\TeamFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Collection;

/** A mirror of a Nexus team; same id as Nexus. */
class Team extends Model
{
    /** @use HasFactory<TeamFactory> */
    use HasFactory;

    protected $guarded = [];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'personal_team' => 'boolean',
            'nexus_synced_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('role')->withTimestamps();
    }

    /**
     * The owner and every member, each with a role. Jetstream never gives
     * the owner a team_user row, so the owner is added here as "owner".
     */
    public function members(): Collection
    {
        $members = $this->users()->orderBy('name')->get()
            ->map(fn (User $user) => [$user, $user->pivot->role]);

        if ($this->owner) {
            $members->prepend([$this->owner, 'owner']);
        }

        return $members->unique(fn (array $member) => $member[0]->id)->values();
    }
}
