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

    private function isBusinessDeveloper(User $user): bool
    {
        return $user->employee?->role?->slug === 'business-developer';
    }

    /** User login boleh membuka daftar project. */
    public function viewAny(User $user): bool
    {
        return $this->isPm($user) || $this->isBusinessDeveloper($user);
    }

    /** PM dan BD melihat semua project. */
    public function view(User $user, Project $project): bool
    {
        return $this->isPm($user) || $this->isBusinessDeveloper($user);
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
