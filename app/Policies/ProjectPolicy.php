<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /** Determine whether the user can list projects they are involved in. */
    public function viewAny(User $user): bool
    {
        return $user->isProjectManager()
            || $user->projects()->exists()
            || $user->managedProjects()->exists();
    }

    /** Determine whether the user can view a specific project. */
    public function view(User $user, Project $project): bool
    {
        return $user->isProjectMember($project);
    }

    /** Determine whether the user can create new projects (PM only). */
    public function create(User $user): bool
    {
        return $user->isProjectManager();
    }

    /** Determine whether the user can update a project (creator only). */
    public function update(User $user, Project $project): bool
    {
        return $project->created_by === $user->id;
    }

    /** Determine whether the user can delete a project (creator only). */
    public function delete(User $user, Project $project): bool
    {
        return $project->created_by === $user->id;
    }

    /** Determine whether the user can restore a project (creator only). */
    public function restore(User $user, Project $project): bool
    {
        return $project->created_by === $user->id;
    }

    /** Determine whether the user can permanently delete a project (creator only). */
    public function forceDelete(User $user, Project $project): bool
    {
        return $project->created_by === $user->id;
    }

    /** Determine whether the user can manage project members (creator only). */
    public function manageMembers(User $user, Project $project): bool
    {
        return $project->created_by === $user->id;
    }

    /** Determine whether the user can manage project tasks (creator or PM). */
    public function manageTasks(User $user, Project $project): bool
    {
        return $project->created_by === $user->id || $user->isProjectManager();
    }
}
