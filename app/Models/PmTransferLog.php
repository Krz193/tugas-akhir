<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class PmTransferLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'actor_user_id',
        'old_pm_user_id',
        'new_pm_user_id',
        'reason',
        'transferred_at',
    ];

    protected function casts(): array
    {
        return [
            'transferred_at' => 'datetime',
        ];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    public function oldPm(): BelongsTo
    {
        return $this->belongsTo(User::class, 'old_pm_user_id');
    }

    public function newPm(): BelongsTo
    {
        return $this->belongsTo(User::class, 'new_pm_user_id');
    }
}
