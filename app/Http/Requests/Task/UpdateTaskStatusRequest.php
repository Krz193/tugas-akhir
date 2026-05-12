<?php

namespace App\Http\Requests\Task;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Task $task */
        $task = $this->route('task');

        $user = $this->user();

        if (! $user || ! $task) {
            return false;
        }

        // PM bypass
        if ($user->isProjectManager()) {
            return true;
        }

        // hanya assignee boleh update
        if ($task->assigned_to !== $user->id) {
            return false;
        }

        $nextStatus = $this->input('status');

        // final states terkunci
        if (in_array($task->status, ['pending_review', 'done'])) {
            return false;
        }

        // todo -> in_progress
        if (
            $task->status === 'todo'
            && $nextStatus === 'in_progress'
        ) {
            return true;
        }

        // in_progress -> pending_review
        if (
            $task->status === 'in_progress'
            && $nextStatus === 'pending_review'
        ) {
            return true;
        }

        return false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:todo,in_progress,pending_review,done'],
        ];
    }
}
