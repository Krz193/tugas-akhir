<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'status',
        'start_date',
        'due_date',
    ];

    protected $appends = [
        'progress_percentage',
    ];

    protected function casts(): array
    {
        return [
            'price'      => 'decimal:2',
            'start_date' => 'date',
            'due_date'   => 'date',
        ];
    }

    protected function progressPercentage(): Attribute
    {
        return Attribute::make(
            get: function () {
                $totalTasks = $this->tasks_count ?? $this->tasks()->count();
                $doneTasks = $this->done_tasks_count ?? $this->tasks()->where('status', 'done')->count();

                if ($totalTasks === 0) {
                    return null;
                }

                return round(($doneTasks / $totalTasks) * 100);
            }
        );
    }

    public function members(): HasMany
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function projectMessages(): HasMany
    {
        return $this->hasMany(ProjectMessage::class);
    }
}
