<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * ORDER MATTERS — each seeder depends on the one before it:
     *   1. RoleSeeder     → no dependencies
     *   2. DivisionSeeder → no dependencies
     *   3. UserSeeder     → needs roles + divisions to exist
     *   4. ProjectSeeder  → needs users to exist
     *   5. TaskSeeder     → needs projects + users to exist
     *   6. MessageSeeder  → needs projects + tasks + users to exist
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            DivisionSeeder::class,
            UserSeeder::class,
            ProjectSeeder::class,
            TaskSeeder::class,
            MessageSeeder::class,
        ]);
    }
}
