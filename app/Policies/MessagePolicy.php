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

    /** Mengecek apakah employee menjadi anggota project pesan ini. */
    private function canAccessThread(User $user, Message $message): bool
    {
        $employeeId = $user->employee?->id;

        if ($employeeId === null) {
            return false;
        }

        $message->loadMissing('thread.task.project');
        $project = $message->thread?->task?->project;

        if ($project === null) {
            return false;
        }

        return $project->members()->where('employee_id', $employeeId)->exists();
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Message $message): bool
    {
        return $this->isPm($user) || $this->canAccessThread($user, $message);
    }

    /** Anggota project boleh membuat pesan di project atau task. */
    public function create(User $user, Project|Task $owner): bool
    {
        if ($this->isPm($user)) {
            return true;
        }

        $employeeId = $user->employee?->id;

        if ($employeeId === null) {
            return false;
        }

        $project = $owner instanceof Task ? $owner->project : $owner;

        if ($project === null) {
            return false;
        }

        return $project->members()->where('employee_id', $employeeId)->exists();
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
