<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserManagementFinalTest extends TestCase
{
    use RefreshDatabase;

    public function test_pm_can_open_user_management_page(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $targetUser = $this->createUserWithRole('team-member', 'Target User');

        $this->actingAs($pm)
            ->get(route('users.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('users/index')
                ->has('users')
                ->where('users.0.id', $targetUser->id)
                ->where('users.0.employee.name', 'Target User')
            );
    }

    public function test_pm_can_create_update_and_delete_user(): void
    {
        $pm = $this->createUserWithRole('project-manager');
        $role = Role::query()->firstOrCreate(
            ['slug' => 'team-member'],
            ['name' => 'Team Member']
        );
        $division = Division::query()->create([
            'name' => 'Engineering',
            'code' => 'ENG',
        ]);

        $this->actingAs($pm)
            ->post(route('users.store'), [
                'email' => 'new-user@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
                'name' => 'New User',
                'role_id' => $role->id,
                'division_id' => $division->id,
                'phone' => '08123456789',
                'address' => 'Makassar',
            ])
            ->assertRedirect(route('users.index'));

        $managedUser = User::query()->where('email', 'new-user@example.com')->firstOrFail();

        $this->assertDatabaseHas('employees', [
            'user_id' => $managedUser->id,
            'role_id' => $role->id,
            'division_id' => $division->id,
            'name' => 'New User',
        ]);

        $this->actingAs($pm)
            ->patch(route('users.update', $managedUser), [
                'email' => 'updated-user@example.com',
                'password' => '',
                'password_confirmation' => '',
                'name' => 'Updated User',
                'role_id' => $role->id,
                'division_id' => $division->id,
                'phone' => '08987654321',
                'address' => 'Gowa',
            ])
            ->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', [
            'id' => $managedUser->id,
            'email' => 'updated-user@example.com',
        ]);

        $this->assertDatabaseHas('employees', [
            'user_id' => $managedUser->id,
            'name' => 'Updated User',
            'phone' => '08987654321',
            'address' => 'Gowa',
        ]);

        $this->actingAs($pm)
            ->delete(route('users.destroy', $managedUser))
            ->assertRedirect(route('users.index'));

        $this->assertDatabaseMissing('users', ['id' => $managedUser->id]);
        $this->assertDatabaseMissing('employees', ['user_id' => $managedUser->id]);
    }

    public function test_non_pm_cannot_access_user_management(): void
    {
        $businessDeveloper = $this->createUserWithRole('business-developer');

        $this->actingAs($businessDeveloper)
            ->get(route('users.index'))
            ->assertForbidden();
    }

    private function createUserWithRole(string $roleSlug, ?string $name = null): User
    {
        $role = Role::query()->firstOrCreate(
            ['slug' => $roleSlug],
            ['name' => str($roleSlug)->replace('-', ' ')->title()]
        );

        $user = User::factory()->create();

        Employee::factory()->create([
            'user_id' => $user->id,
            'role_id' => $role->id,
            'name' => $name ?? str($roleSlug)->replace('-', ' ')->title(),
        ]);

        return $user->load('employee.role');
    }
}
