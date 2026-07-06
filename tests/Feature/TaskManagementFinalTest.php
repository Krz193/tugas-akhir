<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskManagementFinalTest extends TestCase
{
    use RefreshDatabase;

    public function test_pm_can_create_task_for_project_member(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $assignee = $this->createUserWithRole('team-member')->employee;
        $project = $this->createProjectWithMember($assignee);

        $response = $this->actingAs($pm)->post(route('projects.tasks.store', $project), [
            'title' => 'Setup milestones',
            'description' => 'Define milestone map',
            'assigned_employee_id' => $assignee->id,
            'start_date' => '2026-05-01',
            'due_date' => '2026-05-10',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('tasks', [
            'project_id' => $project->id,
            'assigned_employee_id' => $assignee->id,
            'title' => 'Setup milestones',
            'status' => 'todo',
        ]);
    }

    public function test_task_assignee_must_be_project_member(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $outsider = $this->createUserWithRole('team-member')->employee;
        $project = Project::query()->create(['name' => 'Task Scope', 'status' => 'planning']);

        $this->actingAs($pm)
            ->post(route('projects.tasks.store', $project), [
                'title' => 'Invalid assignee',
                'assigned_employee_id' => $outsider->id,
            ])
            ->assertSessionHasErrors('assigned_employee_id');
    }

    public function test_assignee_can_update_task_status(): void
    {
        $assignee = $this->createUserWithRole('team-member');
        $project = $this->createProjectWithMember($assignee->employee);

        $task = Task::query()->create([
            'project_id' => $project->id,
            'assigned_employee_id' => $assignee->employee->id,
            'title' => 'Implement API',
            'status' => 'todo',
        ]);

        $this->actingAs($assignee)
            ->patch(route('tasks.status.update', $task), ['status' => 'done'])
            ->assertRedirect();

        $this->assertSame('done', $task->refresh()->status);
    }

    public function test_non_member_cannot_view_task(): void
    {
        $outsider = $this->createUserWithRole('team-member');
        $project = Project::query()->create(['name' => 'Private', 'status' => 'planning']);

        $task = Task::query()->create([
            'project_id' => $project->id,
            'title' => 'Secret Task',
            'status' => 'todo',
        ]);

        $this->actingAs($outsider)
            ->get(route('tasks.show', $task))
            ->assertForbidden();
    }

    private function createProjectWithMember(Employee $employee): Project
    {
        $project = Project::query()->create(['name' => 'Task Scope', 'status' => 'planning']);

        ProjectMember::query()->create([
            'project_id' => $project->id,
            'employee_id' => $employee->id,
            'date_joined' => now(),
            'is_leader' => false,
        ]);

        return $project;
    }

    private function createUserWithRole(string $roleSlug): User
    {
        $role = Role::query()->firstOrCreate(
            ['slug' => $roleSlug],
            ['name' => str($roleSlug)->replace('-', ' ')->title()]
        );

        $user = User::factory()->create();

        Employee::factory()->create([
            'user_id' => $user->id,
            'role_id' => $role->id,
        ]);

        return $user->load('employee.role');
    }
}
