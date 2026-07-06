<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    public function test_pm_has_global_project_access_and_bd_needs_membership(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $businessDeveloper = $this->createUserWithRole('business-developer');
        $member = $this->createUserWithRole('team-member');
        $project = Project::query()->create(['name' => 'Private', 'status' => 'planning']);

        $this->actingAs($pm)
            ->get(route('projects.show', $project))
            ->assertOk();

        $this->actingAs($businessDeveloper)
            ->get(route('projects.show', $project))
            ->assertForbidden();

        ProjectMember::query()->create([
            'project_id' => $project->id,
            'employee_id' => $businessDeveloper->employee->id,
            'date_joined' => now(),
            'is_leader' => false,
        ]);

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
            ->assertForbidden();
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

        ProjectMember::query()->create([
            'project_id' => $project->id,
            'employee_id' => $businessDeveloper->employee->id,
            'date_joined' => now(),
            'is_leader' => false,
        ]);

        $this->actingAs($businessDeveloper)
            ->patch(route('projects.update', $project), ['name' => 'Changed'])
            ->assertForbidden();

        $this->assertSame('BD Project', $project->refresh()->name);
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
