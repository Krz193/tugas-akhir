<?php

namespace Database\Factories;

use App\Models\Division;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    /**
     * Default state — creates an employee profile linked to a new User.
     * role_id and division_id are nullable and left null by default.
     * Use state methods below to assign a specific role or division.
     */
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'role_id'     => null,
            'division_id' => null,
            'name'        => fake()->name(),
            'phone'       => null,
            'address'     => null,
        ];
    }

    /**
     * Assign the Project Manager role.
     * Roles must be seeded before this state is called.
     */
    public function projectManager(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::where('slug', 'project-manager')->value('id'),
        ]);
    }

    /**
     * Assign the Business Developer role.
     */
    public function businessDeveloper(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::where('slug', 'business-developer')->value('id'),
        ]);
    }

    /**
     * Assign the Team Member role.
     */
    public function teamMember(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::where('slug', 'team-member')->value('id'),
        ]);
    }

    /**
     * Assign a division by code (e.g. 'ENG', 'MKT', 'DES').
     * Divisions must be seeded before this state is called.
     */
    public function inDivision(string $code): static
    {
        return $this->state(fn () => [
            'division_id' => Division::where('code', $code)->value('id'),
        ]);
    }
}
