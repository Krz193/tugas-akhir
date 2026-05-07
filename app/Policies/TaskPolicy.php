<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /** Determine whether the user can list tasks from projects they belong to. */
    public function viewAny(User $user): bool
    {
        return $user->projects()->exists() || $user->managedProjects()->exists();
    }

    /** Determine whether the user can view a task in its project context. */
    public function view(User $user, Task $task): bool
    {
        return $user->isProjectMember($task->project);
    }

    /** Determine whether the user can create a task globally or within a specific project. */
    public function create(User $user, ?Project $project = null): bool
    {
        if ($project === null) {
            return $user->isProjectManager();
        }

        return $user->isProjectMember($project) && ($project->created_by === $user->id || $user->isProjectManager());
    }

    /** Determine whether the user can update task details. */
    public function update(User $user, Task $task): bool
    {
        if (! $user->isProjectMember($task->project)) {
            return false;
        }

        return $task->project->created_by === $user->id
            || $task->created_by === $user->id
            || $task->assigned_to === $user->id
            || $user->isProjectManager();
    }

    /** Determine whether the user can delete a task. */
    public function delete(User $user, Task $task): bool
    {
        return $user->isProjectMember($task->project)
            && ($task->project->created_by === $user->id || $user->isProjectManager());
    }

    /** Determine whether the user can restore a task. */
    public function restore(User $user, Task $task): bool
    {
        return $user->isProjectMember($task->project)
            && ($task->project->created_by === $user->id || $user->isProjectManager());
    }

    /** Determine whether the user can permanently delete a task. */
    public function forceDelete(User $user, Task $task): bool
    {
        return $user->isProjectMember($task->project)
            && ($task->project->created_by === $user->id || $user->isProjectManager());
    }

    /** Determine whether the user can update a task status. */
    public function updateStatus(User $user, Task $task): bool
    {
        if (! $user->isProjectMember($task->project)) {
            return false;
        }

        return $task->assigned_to === $user->id
            || $task->project->created_by === $user->id
            || $user->isProjectManager();
    }
}
