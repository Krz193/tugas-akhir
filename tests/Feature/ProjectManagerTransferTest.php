<?php

namespace Tests\Feature;

use App\Models\PmTransferLog;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectManagerTransferTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_manager_can_transfer_role_and_audit_is_created(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $memberRole = Role::query()->create(['name' => 'Team Member', 'slug' => 'team-member']);

        $currentPm = User::factory()->create(['role_id' => $pmRole->id]);
        $targetUser = User::factory()->create(['role_id' => $memberRole->id]);

        $response = $this->actingAs($currentPm)->post(route('pm.transfer'), [
            'new_pm_user_id' => $targetUser->id,
            'reason' => 'handover',
        ]);

        $response->assertRedirect();

        $currentPm->refresh();
        $targetUser->refresh();

        $this->assertNull($currentPm->role_id);
        $this->assertSame($pmRole->id, $targetUser->role_id);

        $this->assertDatabaseHas('pm_transfer_logs', [
            'actor_user_id' => $currentPm->id,
            'old_pm_user_id' => $currentPm->id,
            'new_pm_user_id' => $targetUser->id,
            'reason' => 'handover',
        ]);

        $this->assertSame(1, PmTransferLog::query()->count());
    }

    public function test_non_project_manager_cannot_transfer_pm_role(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $memberRole = Role::query()->create(['name' => 'Team Member', 'slug' => 'team-member']);

        User::factory()->create(['role_id' => $pmRole->id]);
        $nonPm = User::factory()->create(['role_id' => $memberRole->id]);
        $targetUser = User::factory()->create(['role_id' => $memberRole->id]);

        $this->actingAs($nonPm)
            ->post(route('pm.transfer'), ['new_pm_user_id' => $targetUser->id])
            ->assertForbidden();
    }

    public function test_transfer_rejects_same_user_target(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $currentPm = User::factory()->create(['role_id' => $pmRole->id]);

        $this->actingAs($currentPm)
            ->post(route('pm.transfer'), ['new_pm_user_id' => $currentPm->id])
            ->assertSessionHasErrors('new_pm_user_id');
    }
}
