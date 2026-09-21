<?php

namespace App\Http\Requests\Task;

use App\Models\Employee;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Project $project */
        $project = $this->route('project');

        return $this->user() !== null && $this->user()->can('create', [Task::class, $project]);
    }

    public function rules(): array
    {
        /** @var Project $project */
        $project = $this->route('project');

        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'assigned_employee_id' => [
                'nullable',
                'integer',
                Rule::exists(Employee::class, 'id'),
                function (string $attribute, mixed $value, \Closure $fail) use ($project): void {
                    if ($value === null) {
                        return;
                    }

                    $allowed = $project->members()
                        ->whereHas('employee.role', fn ($query) => $query->where('slug', 'team-member'))
                        ->where('employee_id', (int) $value)
                        ->exists();

                    if (! $allowed) {
                        $fail('The selected assignee must be a Team Member project member.');
                    }
                },
            ],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}
