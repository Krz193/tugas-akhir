<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Cached hashed password shared across all factory-created users (faster tests).
     */
    protected static ?string $password;

    /**
     * Default state — creates an auth-only user account.
     * Profile data (name, role, division, etc.) belongs to the Employee model.
     */
    public function definition(): array
    {
        return [
            'email'                       => fake()->unique()->safeEmail(),
            'email_verified_at'           => now(),
            'password'                    => static::$password ??= Hash::make('password'),
            'two_factor_secret'           => null,
            'two_factor_recovery_codes'   => null,
            'two_factor_confirmed_at'     => null,
            'remember_token'              => Str::random(10),
        ];
    }

    /**
     * Mark the user's email as unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn () => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Add two-factor authentication config to the user.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn () => [
            'two_factor_secret'           => encrypt('secret'),
            'two_factor_recovery_codes'   => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at'     => now(),
        ]);
    }
}
