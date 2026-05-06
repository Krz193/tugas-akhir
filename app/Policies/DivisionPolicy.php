<?php

namespace App\Policies;

use App\Models\Division;
use App\Models\User;

class DivisionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isProjectManager();
    }

    public function view(User $user, Division $division): bool
    {
        return $user->isProjectManager() || $division->isLedBy($user);
    }

    public function create(User $user): bool
    {
        return $user->isProjectManager();
    }

    public function update(User $user, Division $division): bool
    {
        return $user->isProjectManager();
    }

    public function delete(User $user, Division $division): bool
    {
        return $user->isProjectManager();
    }

    public function restore(User $user, Division $division): bool
    {
        return $user->isProjectManager();
    }

    public function forceDelete(User $user, Division $division): bool
    {
        return $user->isProjectManager();
    }

    /** Determine whether the user can assign or change the lead of a division. */
    public function updateLead(User $user, Division $division): bool
    {
        return $user->isProjectManager();
    }
}
