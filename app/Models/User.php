<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'division_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
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
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    /** Get the division where this user is assigned as lead. */
    public function leadedDivision(): HasOne
    {
        return $this->hasOne(Division::class, 'lead_user_id');
    }

    public function managedProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'created_by');
    }

    public function projectMemberships(): HasMany
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_members')
            ->withPivot(['added_by', 'joined_at'])
            ->withTimestamps();
    }

    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function uploadedAttachments(): HasMany
    {
        return $this->hasMany(Attachment::class, 'uploaded_by');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /** Check whether the user role slug matches any of the given role slugs. */
    public function hasRole(string ...$slugs): bool
    {
        $slug = $this->role?->slug;

        return $slug !== null && in_array($slug, $slugs, true);
    }

    /** Check whether the user has the Project Manager role. */
    public function isProjectManager(): bool
    {
        return $this->hasRole('project-manager', 'pm');
    }

    /** Check whether the user is the creator or a registered member of a project. */
    public function isProjectMember(Project $project): bool
    {
        if ($project->created_by === $this->id) {
            return true;
        }

        return $project->users()->whereKey($this->id)->exists();
    }

    /** Check whether the user is assigned as lead in any division. */
    public function isDivisionLead(): bool
    {
        return $this->leadedDivision()->exists();
    }

    /** Check whether the user is eligible to be assigned as lead for a division. */
    public function canLeadDivision(Division $division): bool
    {
        return (int) $this->division_id === (int) $division->id
            && ! $this->isProjectManager();
    }
}
