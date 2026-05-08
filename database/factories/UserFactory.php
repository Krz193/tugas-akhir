<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     * Cached so all factory users share the same hashed password (faster tests).
     */
    protected static ?string $password;

    /**
     * Default state — creates a plain user with no role or division.
     * role_id and division_id are nullable in the schema, so this is valid.
     * Use state methods below (e.g. ->projectManager()) to assign a role.
     */
    public function definition(): array
    {
        return [
            'name'                        => fake()->name(),
            'email'                       => fake()->unique()->safeEmail(),
            'email_verified_at'           => now(),
            'password'                    => static::$password ??= Hash::make('password'),
            'remember_token'              => Str::random(10),
            'role_id'                     => null,
            'division_id'                 => null,
            'two_factor_secret'           => null,
            'two_factor_recovery_codes'   => null,
            'two_factor_confirmed_at'     => null,
        ];
    }

    // -------------------------------------------------------------------------
    // Role state methods
    // These look up the role id by slug so tests/seeders don't need to
    // hardcode IDs. Roles must be seeded before these are called.
    // -------------------------------------------------------------------------

    /** Creates a user with the Project Manager role. */
    public function projectManager(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::where('slug', 'project-manager')->value('id'),
        ]);
    }

    /** Creates a user with the Business Developer role. */
    public function businessDeveloper(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::where('slug', 'business-developer')->value('id'),
        ]);
    }

    /** Creates a user with the Team Member role. */
    public function teamMember(): static
    {
        return $this->state(fn () => [
            'role_id' => Role::where('slug', 'team-member')->value('id'),
        ]);
    }

    // -------------------------------------------------------------------------
    // Utility state methods (kept from original factory)
    // -------------------------------------------------------------------------

    /** Marks the user's email as unverified. */
    public function unverified(): static
    {
        return $this->state(fn () => [
            'email_verified_at' => null,
        ]);
    }

    /** Adds two-factor authentication config to the user. */
    public function withTwoFactor(): static
    {
        return $this->state(fn () => [
            'two_factor_secret'           => encrypt('secret'),
            'two_factor_recovery_codes'   => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at'     => now(),
        ]);
    }
}
