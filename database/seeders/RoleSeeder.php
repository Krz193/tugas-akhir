<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * These are the only 3 roles that exist in the system.
     * They are fixed — no UI to create more (within TA scope).
     * The slug is used throughout the codebase for role checks,
     * so it must never change after seeding.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'Project Manager',     'slug' => 'project-manager'],
            ['name' => 'Business Developer',  'slug' => 'business-developer'],
            ['name' => 'Team Member',         'slug' => 'team-member'],
        ];

        foreach ($roles as $role) {
            // firstOrCreate: safe to run multiple times — won't create duplicates
            Role::firstOrCreate(
                ['slug' => $role['slug']],
                ['name' => $role['name']],
            );
        }
    }
}
