<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ProjectManagementFinalTest extends TestCase
{
    use RefreshDatabase;

    public function test_pm_can_create_project_with_employee_members(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $member = $this->createUserWithRole('team-member')->employee;

        $response = $this->actingAs($pm)->post(route('projects.store'), [
            'name' => 'Alpha',
            'description' => 'Core migration project',
            'start_date' => '2026-05-01',
            'due_date' => '2026-05-30',
            'member_ids' => [$member->id],
        ]);

        $project = Project::query()->where('name', 'Alpha')->first();

        $response->assertRedirect(route('projects.show', $project));

        $this->assertDatabaseHas('projects', [
            'name' => 'Alpha',
            'status' => 'planning',
        ]);

        $this->assertDatabaseHas('project_members', [
            'project_id' => $project->id,
            'employee_id' => $member->id,
            'is_leader' => false,
        ]);

        $this->assertDatabaseMissing('project_members', [
            'project_id' => $project->id,
            'employee_id' => $pm->employee->id,
        ]);
    }

    public function test_project_members_uses_project_and_employee_as_key(): void
    {
        $columns = Schema::getColumnListing('project_members');

        $this->assertNotContains('id', $columns);
        $this->assertContains('project_id', $columns);
        $this->assertContains('employee_id', $columns);
    }

    public function test_pm_can_add_and_remove_project_member_by_employee_id(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $member = $this->createUserWithRole('team-member')->employee;
        $project = Project::query()->create(['name' => 'Gamma', 'status' => 'planning']);

        $this->actingAs($pm)
            ->post(route('projects.members.store', $project), [
                'employee_id' => $member->id,
                'is_leader' => true,
            ])
            ->assertCreated();

        $this->assertDatabaseHas('project_members', [
            'project_id' => $project->id,
            'employee_id' => $member->id,
            'is_leader' => true,
        ]);

        $this->actingAs($pm)
            ->delete(route('projects.members.destroy', ['project' => $project, 'employee' => $member]))
            ->assertNoContent();

        $this->assertDatabaseMissing('project_members', [
            'project_id' => $project->id,
            'employee_id' => $member->id,
        ]);
    }

    public function test_pm_and_bd_have_global_project_access_without_membership(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $businessDeveloper = $this->createUserWithRole('business-developer');
        $member = $this->createUserWithRole('team-member');
        $nonMember = $this->createUserWithRole('team-member');
        $project = Project::query()->create(['name' => 'Private', 'status' => 'planning']);

        $this->actingAs($pm)
            ->get(route('projects.show', $project))
            ->assertOk();

        $this->actingAs($businessDeveloper)
            ->get(route('projects.show', $project))
            ->assertOk();

        $this->actingAs($nonMember)
            ->get(route('projects.show', $project))
            ->assertForbidden();

        ProjectMember::query()->create([
            'project_id' => $project->id,
            'employee_id' => $member->employee->id,
            'date_joined' => now(),
            'is_leader' => false,
        ]);

        $this->actingAs($businessDeveloper)
            ->get(route('projects.show', $project))
            ->assertOk();

        $this->actingAs($member)
            ->get(route('projects.show', $project))
            ->assertOk();
    }

    public function test_project_member_selection_rejects_pm_and_bd(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $businessDeveloper = $this->createUserWithRole('business-developer');
        $project = Project::query()->create(['name' => 'Members', 'status' => 'planning']);

        $this->actingAs($pm)
            ->withHeader('Accept', 'application/json')
            ->post(route('projects.members.store', $project), [
                'employee_id' => $pm->employee->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('employee_id');

        $this->actingAs($pm)
            ->withHeader('Accept', 'application/json')
            ->post(route('projects.members.store', $project), [
                'employee_id' => $businessDeveloper->employee->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('employee_id');
    }

    public function test_non_pm_cannot_create_project(): void
    {
        $member = $this->createUserWithRole('team-member');

        $this->actingAs($member)
            ->post(route('projects.store'), ['name' => 'Beta'])
            ->assertForbidden();
    }

    public function test_business_developer_cannot_update_project(): void
    {
        $businessDeveloper = $this->createUserWithRole('business-developer');
        $project = Project::query()->create(['name' => 'BD Project', 'status' => 'planning']);

        $this->actingAs($businessDeveloper)
            ->patch(route('projects.update', $project), ['name' => 'Changed'])
            ->assertForbidden();

        $this->assertSame('BD Project', $project->refresh()->name);
    }

    public function test_pm_can_update_project_status(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $project = Project::query()->create(['name' => 'Project Alpha', 'status' => 'planning']);

        $this->actingAs($pm)
            ->patch(route('projects.update', $project), [
                'status' => 'active',
            ])
            ->assertRedirect();

        $this->assertSame('active', $project->refresh()->status);
    }

    public function test_pm_can_create_and_update_project_price(): void
    {
        $pm = $this->createUserWithRole('project-manager');

        $this->actingAs($pm)
            ->post(route('projects.store'), [
                'name' => 'Valued Project',
                'price' => 75000000,
            ])
            ->assertRedirect();

        $project = Project::query()->where('name', 'Valued Project')->first();
        $this->assertNotNull($project);
        $this->assertEquals(75000000, (float) $project->price);

        $this->actingAs($pm)
            ->patch(route('projects.update', $project), [
                'price' => 90000000,
            ])
            ->assertRedirect();

        $this->assertEquals(90000000, (float) $project->refresh()->price);
    }

    public function test_project_detail_loads_task_status_summary(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $project = Project::query()->create(['name' => 'Summary Test', 'status' => 'active']);

        $project->tasks()->create(['title' => 'Task 1', 'status' => 'todo']);
        $project->tasks()->create(['title' => 'Task 2', 'status' => 'in_progress']);
        $project->tasks()->create(['title' => 'Task 3', 'status' => 'done']);

        $this->actingAs($pm)
            ->get(route('projects.show', $project))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('projects/show')
                ->where('project.tasks_count', 3)
                ->where('project.todo_tasks_count', 1)
                ->where('project.in_progress_tasks_count', 1)
                ->where('project.done_tasks_count', 1)
            );
    }

    public function test_pm_can_delete_project(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $member = $this->createUserWithRole('team-member')->employee;
        $project = Project::query()->create(['name' => 'Delete Me', 'status' => 'planning']);

        ProjectMember::query()->create([
            'project_id' => $project->id,
            'employee_id' => $member->id,
            'date_joined' => now(),
            'is_leader' => false,
        ]);

        $task = $project->tasks()->create([
            'title' => 'Project Task',
            'status' => 'todo',
            'assigned_employee_id' => $member->id,
        ]);

        $thread = $task->thread()->create();
        $thread->messages()->create([
            'sender_id' => $member->id,
            'message_body' => 'Task message body',
        ]);

        $project->projectMessages()->create([
            'sender_id' => $pm->employee->id,
            'message_body' => 'Project discussion message',
        ]);

        $response = $this->actingAs($pm)->delete(route('projects.destroy', $project));

        $response->assertRedirect(route('projects.index'));

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->assertDatabaseMissing('project_members', ['project_id' => $project->id]);
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
        $this->assertDatabaseMissing('threads', ['id' => $thread->id]);
        $this->assertDatabaseMissing('message_project', ['project_id' => $project->id]);
    }

    public function test_non_pm_cannot_delete_project(): void
    {
        $member = $this->createUserWithRole('team-member');
        $businessDeveloper = $this->createUserWithRole('business-developer');
        $project = Project::query()->create(['name' => 'Protected Project', 'status' => 'planning']);

        $this->actingAs($member)
            ->delete(route('projects.destroy', $project))
            ->assertForbidden();

        $this->actingAs($businessDeveloper)
            ->delete(route('projects.destroy', $project))
            ->assertForbidden();

        $this->assertDatabaseHas('projects', ['id' => $project->id]);
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
