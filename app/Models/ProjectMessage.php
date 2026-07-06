<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMessage extends Model
{
    use HasFactory;

    /**
     * Nama tabel memakai ERD final.
     * Laravel perlu diberi tahu nama tabel ini.
     */
    protected $table = 'message_project';

    protected $fillable = [
        'project_id',
        'sender_id',
        'message_body',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'sender_id');
    }
}
