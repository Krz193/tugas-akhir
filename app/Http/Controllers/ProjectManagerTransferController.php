<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\TransferProjectManagerRequest;
use App\Models\PmTransferLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ProjectManagerTransferController extends Controller
{
    /** Transfer Project Manager role to another user in a single transaction. */
    public function store(TransferProjectManagerRequest $request): RedirectResponse
    {
        $actor = $request->user();

        if (! $actor instanceof User) {
            throw new AuthorizationException();
        }

        $newPmUserId = (int) $request->validated('new_pm_user_id');

        DB::transaction(function () use ($actor, $newPmUserId, $request): void {
            $pmRole = Role::query()
                ->where('slug', 'project-manager')
                ->lockForUpdate()
                ->first();

            if (! $pmRole instanceof Role) {
                throw new RuntimeException('Project Manager role is not configured.');
            }

            $oldPm = User::query()
                ->where('role_id', $pmRole->id)
                ->lockForUpdate()
                ->first();

            if (! $oldPm instanceof User || $oldPm->id !== $actor->id) {
                throw new AuthorizationException();
            }

            $newPm = User::query()
                ->lockForUpdate()
                ->findOrFail($newPmUserId);

            $oldPm->forceFill(['role_id' => null])->save();
            $newPm->forceFill(['role_id' => $pmRole->id])->save();

            PmTransferLog::query()->create([
                'actor_user_id' => $actor->id,
                'old_pm_user_id' => $oldPm->id,
                'new_pm_user_id' => $newPm->id,
                'reason' => $request->validated('reason'),
                'transferred_at' => now(),
            ]);
        });

        return back()->with('success', 'Project Manager transferred successfully.');
    }
}
