<?php

use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

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
