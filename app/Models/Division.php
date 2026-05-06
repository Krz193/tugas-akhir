<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'lead_user_id',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /** Get the lead user assigned to this division. */
    public function lead(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lead_user_id');
    }

    /** Check whether the given user is the lead of this division. */
    public function isLedBy(User $user): bool
    {
        return (int) $this->lead_user_id === (int) $user->id;
    }
}
