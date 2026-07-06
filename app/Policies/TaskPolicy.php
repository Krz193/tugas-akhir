<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    private function isPm(User $user): bool
    {
        return $user->employee?->role?->slug === 'project-manager';
    }

    private function isProjectMember(User $user, Project $project): bool
    {
        $employeeId = $user->employee?->id;

        if ($employeeId === null) {
            return false;
        }

        return $project->members()->where('employee_id', $employeeId)->exists();
    }

    /** User login boleh membuka daftar task. */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /** PM melihat semua task. User lain harus menjadi anggota project. */
    public function view(User $user, Task $task): bool
    {
        return $this->isPm($user) || $this->isProjectMember($user, $task->project);
    }

    /** Hanya PM yang boleh membuat task. */
    public function create(User $user, ?Project $project = null): bool
    {
        return $this->isPm($user);
    }

    /** Hanya PM yang boleh mengubah detail task. */
    public function update(User $user, Task $task): bool
    {
        return $this->isPm($user);
    }

    /** Hanya PM yang boleh menghapus task. */
    public function delete(User $user, Task $task): bool
    {
        return $this->isPm($user);
    }

    public function restore(User $user, Task $task): bool
    {
        return $this->isPm($user);
    }

    public function forceDelete(User $user, Task $task): bool
    {
        return $this->isPm($user);
    }

    /** PM dapat mengubah semua status. Assignee hanya task miliknya. */
    public function updateStatus(User $user, Task $task): bool
    {
        if ($this->isPm($user)) {
            return true;
        }

        $employeeId = $user->employee?->id;

        return $employeeId !== null
            && (int) $task->assigned_employee_id === (int) $employeeId;
    }
}
