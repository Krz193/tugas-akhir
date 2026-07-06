<?php

use App\Models\Employee;
use App\Models\Role;
use App\Models\User;

test('project manager login redirects to dashboard', function () {
    $user = createUserWithRoleForLogin('project-manager');

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));
});

test('business developer login redirects to dashboard', function () {
    $user = createUserWithRoleForLogin('business-developer');

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));
});

test('team member login redirects to my tasks', function () {
    $user = createUserWithRoleForLogin('team-member');

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('tasks.my', absolute: false));
});

test('team member login ignores dashboard intended URL', function () {
    $user = createUserWithRoleForLogin('team-member');

    $this->get(route('dashboard'));

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('tasks.my', absolute: false));
});

test('authenticated users opening home are redirected by role', function () {
    $pm = createUserWithRoleForLogin('project-manager');
    $businessDeveloper = createUserWithRoleForLogin('business-developer');
    $teamMember = createUserWithRoleForLogin('team-member');

    $this->actingAs($pm)
        ->get(route('home'))
        ->assertRedirect(route('dashboard', absolute: false));

    $this->actingAs($businessDeveloper)
        ->get(route('home'))
        ->assertRedirect(route('dashboard', absolute: false));

    $this->actingAs($teamMember)
        ->get(route('home'))
        ->assertRedirect(route('tasks.my', absolute: false));
});

function createUserWithRoleForLogin(string $roleSlug): User
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
