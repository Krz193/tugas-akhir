<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_pm_can_create_task_in_project(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);

        $project = Project::query()->create([
            'created_by' => $pm->id,
            'name' => 'Task Scope',
            'status' => 'planning',
        ]);

        $response = $this->actingAs($pm)->post(route('projects.tasks.store', $project), [
            'title' => 'Setup milestones',
            'description' => 'Define milestone map',
        ]);

        // store() now redirects back (Inertia page flow)
        $response->assertRedirect();
        $this->assertDatabaseHas('tasks', [
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'title' => 'Setup milestones',
            'status' => 'todo',
        ]);
    }

    public function test_bd_cannot_create_task(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $bdRole = Role::query()->create(['name' => 'Business Developer', 'slug' => 'business-developer']);

        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $bd = User::factory()->create(['role_id' => $bdRole->id]);

        $project = Project::query()->create([
            'created_by' => $pm->id,
            'name' => 'Collab',
            'status' => 'planning',
        ]);

        ProjectMember::query()->create([
            'project_id' => $project->id,
            'user_id' => $bd->id,
            'added_by' => $pm->id,
            'joined_at' => now(),
        ]);

        $this->actingAs($bd)
            ->post(route('projects.tasks.store', $project), ['title' => 'BD task'])
            ->assertForbidden();
    }

    public function test_assignee_can_update_task_status(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $memberRole = Role::query()->create(['name' => 'Team Member', 'slug' => 'team-member']);

        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $assignee = User::factory()->create(['role_id' => $memberRole->id]);

        $project = Project::query()->create([
            'created_by' => $pm->id,
            'name' => 'Execution',
            'status' => 'planning',
        ]);

        ProjectMember::query()->create([
            'project_id' => $project->id,
            'user_id' => $assignee->id,
            'added_by' => $pm->id,
            'joined_at' => now(),
        ]);

        $task = Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'assigned_to' => $assignee->id,
            'title' => 'Implement API',
            'status' => 'todo',
            'priority' => 'medium',
            'position' => 0,
        ]);

        // updateStatus() now redirects back (Inertia page flow)
        $this->actingAs($assignee)
            ->patch(route('tasks.status.update', $task), ['status' => 'done'])
            ->assertRedirect();

        // Verify the database was actually updated
        $task->refresh();
        $this->assertEquals('done', $task->status);
        $this->assertNotNull($task->completed_at);
    }

    public function test_non_member_cannot_view_task(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $outsider = User::factory()->create();

        $project = Project::query()->create([
            'created_by' => $pm->id,
            'name' => 'Private',
            'status' => 'planning',
        ]);

        $task = Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'title' => 'Secret Task',
            'status' => 'todo',
            'priority' => 'medium',
            'position' => 0,
        ]);

        $this->actingAs($outsider)
            ->get(route('tasks.show', $task))
            ->assertForbidden();
    }
}
