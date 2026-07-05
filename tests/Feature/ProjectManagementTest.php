<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_pm_can_create_project(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);

        $response = $this->actingAs($pm)->post(route('projects.store'), [
            'name' => 'Alpha',
            'description' => 'Core migration project',
            'start_date' => '2026-05-01',
            'due_date' => '2026-05-30',
        ]);

        // store() now returns JSON with created project
        $response->assertCreated();
        $this->assertDatabaseHas('projects', [
            'name' => 'Alpha',
            'created_by' => $pm->id,
        ]);
    }

    public function test_non_pm_cannot_create_project(): void
    {
        $memberRole = Role::query()->create(['name' => 'Team Member', 'slug' => 'team-member']);
        $member = User::factory()->create(['role_id' => $memberRole->id]);

        $this->actingAs($member)
            ->post(route('projects.store'), ['name' => 'Beta'])
            ->assertForbidden();
    }

    public function test_project_creator_can_add_and_remove_member(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $member = User::factory()->create();

        $project = Project::query()->create([
            'created_by' => $pm->id,
            'name' => 'Gamma',
            'status' => 'planning',
        ]);

        $this->actingAs($pm)
            ->post(route('projects.members.store', $project), ['user_id' => $member->id])
            ->assertCreated();

        $this->assertDatabaseHas('project_members', [
            'project_id' => $project->id,
            'user_id' => $member->id,
        ]);

        $this->actingAs($pm)
            ->delete(route('projects.members.destroy', ['project' => $project, 'user' => $member]))
            ->assertNoContent();

        $this->assertDatabaseMissing('project_members', [
            'project_id' => $project->id,
            'user_id' => $member->id,
        ]);
    }

    public function test_non_creator_cannot_manage_members(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $creator = User::factory()->create(['role_id' => $pmRole->id]);
        $otherPm = User::factory()->create(['role_id' => $pmRole->id]);
        $member = User::factory()->create();

        $project = Project::query()->create([
            'created_by' => $creator->id,
            'name' => 'Delta',
            'status' => 'planning',
        ]);

        $this->actingAs($otherPm)
            ->post(route('projects.members.store', $project), ['user_id' => $member->id])
            ->assertForbidden();
    }

    public function test_member_can_view_joined_project(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $creator = User::factory()->create(['role_id' => $pmRole->id]);
        $member = User::factory()->create();

        $project = Project::query()->create([
            'created_by' => $creator->id,
            'name' => 'Epsilon',
            'status' => 'planning',
        ]);

        ProjectMember::query()->create([
            'project_id' => $project->id,
            'user_id' => $member->id,
            'added_by' => $creator->id,
            'joined_at' => now(),
        ]);

        // show() now renders an Inertia page, not JSON
        $this->actingAs($member)
            ->get(route('projects.show', $project))
            ->assertOk();
    }
}
