<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MyTaskFinalTest extends TestCase
{
    use RefreshDatabase;

    public function test_my_tasks_shows_only_assigned_tasks(): void
    {
        $memberA = $this->createUserWithRole('team-member');
        $memberB = $this->createUserWithRole('team-member');
        $project = $this->createProjectWithMembers([$memberA->employee, $memberB->employee]);

        Task::query()->create([
            'project_id' => $project->id,
            'assigned_employee_id' => $memberA->employee->id,
            'title' => 'Task A1',
            'status' => 'todo',
        ]);

        Task::query()->create([
            'project_id' => $project->id,
            'assigned_employee_id' => $memberB->employee->id,
            'title' => 'Task B1',
            'status' => 'todo',
        ]);

        $this->actingAs($memberA)
            ->get(route('tasks.my'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('tasks/my-tasks')
                ->has('tasks.data', 1)
                ->where('tasks.data.0.title', 'Task A1')
            );
    }

    public function test_my_tasks_supports_status_and_project_filters(): void
    {
        $member = $this->createUserWithRole('team-member');
        $projectA = $this->createProjectWithMembers([$member->employee], 'A');
        $projectB = $this->createProjectWithMembers([$member->employee], 'B');

        Task::query()->create([
            'project_id' => $projectA->id,
            'assigned_employee_id' => $member->employee->id,
            'title' => 'A done',
            'status' => 'done',
        ]);

        Task::query()->create([
            'project_id' => $projectB->id,
            'assigned_employee_id' => $member->employee->id,
            'title' => 'B todo',
            'status' => 'todo',
        ]);

        $this->actingAs($member)
            ->get(route('tasks.my', ['status' => 'done', 'project_id' => $projectA->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('tasks/my-tasks')
                ->has('tasks.data', 1)
                ->where('tasks.data.0.title', 'A done')
            );
    }

    public function test_my_tasks_rejects_invalid_status_filter(): void
    {
        $member = $this->createUserWithRole('team-member');

        $this->actingAs($member)
            ->get(route('tasks.my', ['status' => 'blocked']))
            ->assertRedirect()
            ->assertSessionHasErrors('status');
    }

    private function createProjectWithMembers(array $employees, string $name = 'My Tasks Scope'): Project
    {
        $project = Project::query()->create(['name' => $name, 'status' => 'planning']);

        foreach ($employees as $employee) {
            ProjectMember::query()->create([
                'project_id' => $project->id,
                'employee_id' => $employee->id,
                'date_joined' => now(),
                'is_leader' => false,
            ]);
        }

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
