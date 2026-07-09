<?php

namespace App\Http\Requests\Project;

use App\Models\Project;
use App\Models\Employee;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->can('create', Project::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'max:50'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'member_ids' => ['nullable', 'array'],
            'member_ids.*' => [
                'integer',
                Rule::exists(Employee::class, 'id'),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! $this->isTeamMemberEmployee((int) $value)) {
                        $fail('The selected project member must be a Team Member.');
                    }
                },
            ],
        ];
    }

    private function isTeamMemberEmployee(int $employeeId): bool
    {
        return Employee::query()
            ->whereKey($employeeId)
            ->whereHas('role', fn ($query) => $query->where('slug', 'team-member'))
            ->exists();
    }
}
