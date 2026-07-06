<?php

namespace App\Http\Requests\Task;

use App\Models\Employee;
use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Task $task */
        $task = $this->route('task');

        return $this->user() !== null && $this->user()->can('update', $task);
    }

    public function rules(): array
    {
        /** @var Task $task */
        $task = $this->route('task');

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'assigned_employee_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists(Employee::class, 'id'),
                function (string $attribute, mixed $value, \Closure $fail) use ($task): void {
                    if ($value === null) {
                        return;
                    }

                    $allowed = $task->project->members()
                        ->where('employee_id', (int) $value)
                        ->exists();

                    if (! $allowed) {
                        $fail('The selected assignee must be a project member.');
                    }
                },
            ],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'due_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date'],
        ];
    }
}
