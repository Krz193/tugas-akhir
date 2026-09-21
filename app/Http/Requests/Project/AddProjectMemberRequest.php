<?php

namespace App\Http\Requests\Project;

use App\Models\Employee;
use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddProjectMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Project $project */
        $project = $this->route('project');

        return $this->user() !== null && $this->user()->can('manageMembers', $project);
    }

    public function rules(): array
    {
        /** @var Project $project */
        $project = $this->route('project');

        return [
            'employee_id' => [
                'required',
                'integer',
                Rule::exists(Employee::class, 'id'),
                Rule::unique('project_members', 'employee_id')->where(fn ($q) => $q->where('project_id', $project->id)),
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! $this->isTeamMemberEmployee((int) $value)) {
                        $fail('The selected project member must be a Team Member.');
                    }
                },
            ],
            'is_leader' => ['nullable', 'boolean'],
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
