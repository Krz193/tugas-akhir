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

class RoleAccessFinalTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_access_follows_final_roles(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $businessDeveloper = $this->createUserWithRole('business-developer');
        $teamMember = $this->createUserWithRole('team-member');

        $this->actingAs($pm)->get(route('dashboard'))->assertOk();
        $this->actingAs($businessDeveloper)->get(route('dashboard'))->assertOk();
        $this->actingAs($teamMember)->get(route('dashboard'))->assertForbidden();
    }

    public function test_my_task_access_is_team_member_only(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $businessDeveloper = $this->createUserWithRole('business-developer');
        $teamMember = $this->createUserWithRole('team-member');

        $this->actingAs($pm)->get(route('tasks.my'))->assertForbidden();
        $this->actingAs($businessDeveloper)->get(route('tasks.my'))->assertForbidden();
        $this->actingAs($teamMember)->get(route('tasks.my'))->assertOk();
    }

    public function test_project_detail_access_follows_final_roles(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $businessDeveloper = $this->createUserWithRole('business-developer');
        $teamMember = $this->createUserWithRole('team-member');
        $project = Project::query()->create(['name' => 'Access Project', 'status' => 'planning']);

        $this->addMember($project, $businessDeveloper->employee);
        $this->addMember($project, $teamMember->employee);

        $this->actingAs($pm)->get(route('projects.show', $project))->assertOk();
        $this->actingAs($businessDeveloper)->get(route('projects.show', $project))->assertOk();
        $this->actingAs($teamMember)->get(route('projects.show', $project))->assertForbidden();
    }

    public function test_task_detail_access_follows_final_roles(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $businessDeveloper = $this->createUserWithRole('business-developer');
        $teamMember = $this->createUserWithRole('team-member');
        $project = Project::query()->create(['name' => 'Task Access', 'status' => 'planning']);
        $this->addMember($project, $businessDeveloper->employee);
        $this->addMember($project, $teamMember->employee);

        $task = Task::query()->create([
            'project_id' => $project->id,
            'assigned_employee_id' => $teamMember->employee->id,
            'title' => 'Assigned Task',
            'status' => 'todo',
        ]);

        $this->actingAs($pm)->get(route('tasks.show', $task))->assertOk();
        $this->actingAs($businessDeveloper)->get(route('tasks.show', $task))->assertForbidden();
        $this->actingAs($teamMember)->get(route('tasks.show', $task))->assertOk();
    }

    public function test_update_status_is_team_member_assignee_only(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $businessDeveloper = $this->createUserWithRole('business-developer');
        $teamMember = $this->createUserWithRole('team-member');
        $otherTeamMember = $this->createUserWithRole('team-member');
        $project = Project::query()->create(['name' => 'Status Access', 'status' => 'planning']);
        $this->addMember($project, $businessDeveloper->employee);
        $this->addMember($project, $teamMember->employee);
        $this->addMember($project, $otherTeamMember->employee);

        $task = Task::query()->create([
            'project_id' => $project->id,
            'assigned_employee_id' => $teamMember->employee->id,
            'title' => 'Status Task',
            'status' => 'todo',
        ]);

        $this->actingAs($pm)
            ->patch(route('tasks.status.update', $task), ['status' => 'done'])
            ->assertForbidden();

        $this->actingAs($businessDeveloper)
            ->patch(route('tasks.status.update', $task), ['status' => 'done'])
            ->assertForbidden();

        $this->actingAs($otherTeamMember)
            ->patch(route('tasks.status.update', $task), ['status' => 'done'])
            ->assertForbidden();

        $this->actingAs($teamMember)
            ->patch(route('tasks.status.update', $task), ['status' => 'done'])
            ->assertRedirect();
    }

    private function addMember(Project $project, Employee $employee): void
    {
        ProjectMember::query()->create([
            'project_id' => $project->id,
            'employee_id' => $employee->id,
            'date_joined' => now(),
            'is_leader' => false,
        ]);
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
