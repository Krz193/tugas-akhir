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

    private function isTeamMember(User $user): bool
    {
        return $user->employee?->role?->slug === 'team-member';
    }

    private function isAssignedEmployee(User $user, Task $task): bool
    {
        $employeeId = $user->employee?->id;

        return $employeeId !== null
            && (int) $task->assigned_employee_id === (int) $employeeId;
    }

    /** PM mengelola task. Member melihat My Task. */
    public function viewAny(User $user): bool
    {
        return $this->isPm($user) || $this->isTeamMember($user);
    }

    /** PM melihat semua task. Member melihat task miliknya. */
    public function view(User $user, Task $task): bool
    {
        return $this->isPm($user)
            || ($this->isTeamMember($user) && $this->isAssignedEmployee($user, $task));
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

    /** Member hanya dapat mengubah status task miliknya. */
    public function updateStatus(User $user, Task $task): bool
    {
        return $this->isTeamMember($user) && $this->isAssignedEmployee($user, $task);
    }
}
