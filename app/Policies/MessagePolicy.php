<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class MessagePolicy
{
    /** Determine whether the user can list messages in accessible project contexts. */
    public function viewAny(User $user): bool
    {
        return $user->projects()->exists() || $user->managedProjects()->exists();
    }

    /** Determine whether the user can view a specific message based on its owner context. */
    public function view(User $user, Message $message): bool
    {
        return $this->canAccessMessageOwner($user, $message);
    }

    /** Determine whether the user can create a message under a project or task thread. */
    public function create(User $user, Project|Task $owner): bool
    {
        if ($owner instanceof Task) {
            return $user->isProjectMember($owner->project);
        }

        return $user->isProjectMember($owner);
    }

    /** Determine whether the user can update a message. */
    public function update(User $user, Message $message): bool
    {
        if (! $this->canAccessMessageOwner($user, $message)) {
            return false;
        }

        return $message->user_id === $user->id || $user->isProjectManager();
    }

    /** Determine whether the user can delete a message. */
    public function delete(User $user, Message $message): bool
    {
        if (! $this->canAccessMessageOwner($user, $message)) {
            return false;
        }

        return $message->user_id === $user->id || $user->isProjectManager();
    }

    /** Determine whether the user can restore a message. */
    public function restore(User $user, Message $message): bool
    {
        return $this->delete($user, $message);
    }

    /** Determine whether the user can permanently delete a message. */
    public function forceDelete(User $user, Message $message): bool
    {
        return $this->delete($user, $message);
    }

    /** Resolve access to a message by checking membership on the polymorphic owner. */
    protected function canAccessMessageOwner(User $user, Message $message): bool
    {
        $owner = $message->messageable;

        if ($owner instanceof Task) {
            return $user->isProjectMember($owner->project);
        }

        if ($owner instanceof Project) {
            return $user->isProjectMember($owner);
        }

        return false;
    }
}
