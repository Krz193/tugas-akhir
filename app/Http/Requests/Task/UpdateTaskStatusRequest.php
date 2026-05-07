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

        return $this->user() !== null && $this->user()->can('updateStatus', $task);
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:todo,in_progress,done'],
        ];
    }
}
