<?php

use App\Models\Employee;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('project manager can visit the dashboard', function () {
    $role = Role::query()->create([
        'name' => 'Project Manager',
        'slug' => 'project-manager',
    ]);
    $user = User::factory()->create();
    Employee::factory()->create([
        'user_id' => $user->id,
        'role_id' => $role->id,
    ]);

    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard uses final project and task metric contract', function () {
    $role = Role::query()->create([
        'name' => 'Project Manager',
        'slug' => 'project-manager',
    ]);
    $user = User::factory()->create();
    $employee = Employee::factory()->create([
        'user_id' => $user->id,
        'role_id' => $role->id,
    ]);
    $project = Project::query()->create([
        'name' => 'Website Build',
        'status' => 'active',
        'start_date' => today()->subDays(10),
        'due_date' => today()->subDay(),
    ]);

    Task::query()->create([
        'project_id' => $project->id,
        'assigned_employee_id' => $employee->id,
        'title' => 'Write copy',
        'status' => 'in_progress',
        'due_date' => today()->subDay(),
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('projectSummary.totalProject', 1)
            ->where('projectSummary.activeProject', 1)
            ->where('projectSummary.overdueProject', 1)
            ->where('projectSummary.totalTask', 1)
            ->where('projectSummary.unfinishedTask', 1)
            ->where('projectSummary.overdueTask', 1)
            ->missing('projectSummary.completedProject')
            ->has('metricRecords.totalProject', 1)
            ->has('metricRecords.overdueTask', 1)
        );
});

test('team member filter only changes task performance metrics', function () {
    $pmRole = Role::query()->create([
        'name' => 'Project Manager',
        'slug' => 'project-manager',
    ]);
    $teamRole = Role::query()->create([
        'name' => 'Team Member',
        'slug' => 'team-member',
    ]);
    $pm = User::factory()->create();
    Employee::factory()->create([
        'user_id' => $pm->id,
        'role_id' => $pmRole->id,
    ]);
    $memberA = Employee::factory()->create([
        'role_id' => $teamRole->id,
        'name' => 'Member A',
    ]);
    $memberB = Employee::factory()->create([
        'role_id' => $teamRole->id,
        'name' => 'Member B',
    ]);
    $project = Project::query()->create([
        'name' => 'Mobile App',
        'status' => 'active',
        'due_date' => today()->addWeek(),
    ]);

    Task::query()->create([
        'project_id' => $project->id,
        'assigned_employee_id' => $memberA->id,
        'title' => 'Overdue task',
        'status' => 'todo',
        'due_date' => today()->subDay(),
    ]);
    Task::query()->create([
        'project_id' => $project->id,
        'assigned_employee_id' => $memberB->id,
        'title' => 'Other task',
        'status' => 'todo',
        'due_date' => today()->subDay(),
    ]);

    $this->actingAs($pm)
        ->get(route('dashboard', ['employee_id' => $memberA->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('selectedEmployeeId', $memberA->id)
            ->where('projectSummary.totalProject', 1)
            ->where('projectSummary.totalTask', 1)
            ->where('projectSummary.overdueTask', 1)
            ->where('metricRecords.overdueTask.0.title', 'Overdue task')
            ->has('teamMembers', 2)
        );
});
