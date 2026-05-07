<?php

namespace App\Http\Requests\Task;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
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
            'assigned_to' => [
                'nullable',
                'integer',
                Rule::exists(User::class, 'id'),
                function (string $attribute, mixed $value, \Closure $fail) use ($project): void {
                    if ($value === null) {
                        return;
                    }

                    $allowed = (int) $value === (int) $project->created_by
                        || $project->users()->whereKey((int) $value)->exists();

                    if (! $allowed) {
                        $fail('The selected assignee must be the project creator or a project member.');
                    }
                },
            ],
            'priority' => ['nullable', 'in:low,medium,high'],
            'start_date' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'position' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
