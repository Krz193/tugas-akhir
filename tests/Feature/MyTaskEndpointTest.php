<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MyTaskEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_my_tasks_returns_only_assigned_tasks(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $memberA = User::factory()->create();
        $memberB = User::factory()->create();

        $project = Project::query()->create([
            'created_by' => $pm->id,
            'name' => 'My Tasks Scope',
            'status' => 'planning',
        ]);

        foreach ([$memberA, $memberB] as $member) {
            ProjectMember::query()->create([
                'project_id' => $project->id,
                'user_id' => $member->id,
                'added_by' => $pm->id,
                'joined_at' => now(),
            ]);
        }

        Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'assigned_to' => $memberA->id,
            'title' => 'Task A1',
            'status' => 'todo',
            'priority' => 'medium',
            'position' => 0,
        ]);

        Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'assigned_to' => $memberB->id,
            'title' => 'Task B1',
            'status' => 'todo',
            'priority' => 'medium',
            'position' => 1,
        ]);

        $this->actingAs($memberA)
            ->get(route('tasks.my'))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Task A1');
    }

    public function test_my_tasks_supports_status_and_project_filters(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $member = User::factory()->create();

        $projectA = Project::query()->create(['created_by' => $pm->id, 'name' => 'A', 'status' => 'planning']);
        $projectB = Project::query()->create(['created_by' => $pm->id, 'name' => 'B', 'status' => 'planning']);

        foreach ([$projectA, $projectB] as $project) {
            ProjectMember::query()->create([
                'project_id' => $project->id,
                'user_id' => $member->id,
                'added_by' => $pm->id,
                'joined_at' => now(),
            ]);
        }

        Task::query()->create([
            'project_id' => $projectA->id,
            'created_by' => $pm->id,
            'assigned_to' => $member->id,
            'title' => 'A done',
            'status' => 'done',
            'priority' => 'medium',
            'position' => 0,
        ]);

        Task::query()->create([
            'project_id' => $projectB->id,
            'created_by' => $pm->id,
            'assigned_to' => $member->id,
            'title' => 'B todo',
            'status' => 'todo',
            'priority' => 'medium',
            'position' => 1,
        ]);

        $this->actingAs($member)
            ->get(route('tasks.my', ['status' => 'done', 'project_id' => $projectA->id]))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'A done');
    }

    public function test_my_tasks_rejects_invalid_status_filter(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member)
            ->get(route('tasks.my', ['status' => 'blocked']))
            ->assertStatus(302)
            ->assertSessionHasErrors('status');
    }
}
