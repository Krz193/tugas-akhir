<?php

namespace App\Http\Requests\Project;

use App\Models\Employee;
use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Project $project */
        $project = $this->route('project');

        return $this->user() !== null && $this->user()->can('update', $project);
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'required', 'string', 'max:50'],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'due_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date'],
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
