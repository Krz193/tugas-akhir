<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    private function isPm(User $user): bool
    {
        return $user->employee?->role?->slug === 'project-manager';
    }

    private function isMember(User $user, Project $project): bool
    {
        $employeeId = $user->employee?->id;

        if ($employeeId === null) {
            return false;
        }

        return $project->members()->where('employee_id', $employeeId)->exists();
    }

    /** User login boleh membuka daftar project. */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /** PM melihat semua project. User lain harus menjadi anggota. */
    public function view(User $user, Project $project): bool
    {
        return $this->isPm($user) || $this->isMember($user, $project);
    }

    /** Hanya PM yang boleh membuat project. */
    public function create(User $user): bool
    {
        return $this->isPm($user);
    }

    /** Hanya PM yang boleh mengubah project. */
    public function update(User $user, Project $project): bool
    {
        return $this->isPm($user);
    }

    /** Hanya PM yang boleh menghapus project. */
    public function delete(User $user, Project $project): bool
    {
        return $this->isPm($user);
    }

    public function restore(User $user, Project $project): bool
    {
        return $this->isPm($user);
    }

    public function forceDelete(User $user, Project $project): bool
    {
        return $this->isPm($user);
    }

    /** Hanya PM yang boleh mengelola anggota project. */
    public function manageMembers(User $user, Project $project): bool
    {
        return $this->isPm($user);
    }

    /** Hanya PM yang boleh mengelola task dalam project. */
    public function manageTasks(User $user, Project $project): bool
    {
        return $this->isPm($user);
    }
}
