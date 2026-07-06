<?php

namespace App\Http\Requests\User;

use App\Models\Division;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->employee?->role?->slug === 'project-manager';
    }

    public function rules(): array
    {
        /** @var User $user */
        $user = $this->route('user');

        return [
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class, 'email')->ignore($user),
            ],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'name' => ['required', 'string', 'max:255'],
            'role_id' => ['required', 'integer', Rule::exists(Role::class, 'id')],
            'division_id' => ['required', 'integer', Rule::exists(Division::class, 'id')],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'avatar_url' => ['nullable', 'string', 'max:255'],
        ];
    }
}
