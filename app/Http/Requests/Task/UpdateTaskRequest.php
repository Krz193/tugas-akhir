<?php

namespace App\Http\Requests\Task;

use App\Models\Task;
use App\Models\User;
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
            'assigned_to' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists(User::class, 'id'),
                function (string $attribute, mixed $value, \Closure $fail) use ($task): void {
                    if ($value === null) {
                        return;
                    }

                    $allowed = (int) $value === (int) $task->project->created_by
                        || $task->project->users()->whereKey((int) $value)->exists();

                    if (! $allowed) {
                        $fail('The selected assignee must be the project creator or a project member.');
                    }
                },
            ],
            'priority' => ['sometimes', 'required', 'in:low,medium,high'],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'due_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date'],
            'position' => ['sometimes', 'required', 'integer', 'min:0'],
        ];
    }
}
