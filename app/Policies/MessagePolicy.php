<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class MessagePolicy
{
    private function isPm(User $user): bool
    {
        return $user->employee?->role?->slug === 'project-manager';
    }

    private function isBusinessDeveloper(User $user): bool
    {
        return $user->employee?->role?->slug === 'business-developer';
    }

    private function isTeamMember(User $user): bool
    {
        return $user->employee?->role?->slug === 'team-member';
    }

    private function isProjectMember(User $user, Project $project): bool
    {
        $employeeId = $user->employee?->id;

        if ($employeeId === null) {
            return false;
        }

        return $project->members()->where('employee_id', $employeeId)->exists();
    }

    /** Mengecek apakah member pemilik task dapat membaca thread. */
    private function canAccessThread(User $user, Message $message): bool
    {
        $employeeId = $user->employee?->id;

        if ($employeeId === null || ! $this->isTeamMember($user)) {
            return false;
        }

        $message->loadMissing('thread.task.project');
        $task = $message->thread?->task;

        if ($task === null) {
            return false;
        }

        return (int) $task->assigned_employee_id === (int) $employeeId;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Message $message): bool
    {
        return $this->isPm($user) || $this->canAccessThread($user, $message);
    }

    /** PM dan BD mengirim pesan project. PM dan assignee mengirim pesan task. */
    public function create(User $user, Project|Task $owner): bool
    {
        if ($this->isPm($user)) {
            return true;
        }

        if ($owner instanceof Project) {
            return $this->isBusinessDeveloper($user) && $this->isProjectMember($user, $owner);
        }

        $employeeId = $user->employee?->id;

        if ($employeeId === null || ! $this->isTeamMember($user)) {
            return false;
        }

        return (int) $owner->assigned_employee_id === (int) $employeeId;
    }

    /** PM boleh mengubah semua pesan. Pengirim boleh mengubah pesan sendiri. */
    public function update(User $user, Message $message): bool
    {
        if ($this->isPm($user)) {
            return true;
        }

        $employeeId = $user->employee?->id;

        return $employeeId !== null
            && (int) $message->sender_id === (int) $employeeId;
    }

    public function delete(User $user, Message $message): bool
    {
        return $this->update($user, $message);
    }

    public function restore(User $user, Message $message): bool
    {
        return $this->update($user, $message);
    }

    public function forceDelete(User $user, Message $message): bool
    {
        return $this->update($user, $message);
    }
}
