<?php

namespace App\Http\Requests\Message;

use App\Models\Message;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $owner = $this->route('project') ?? $this->route('task');

        return $owner instanceof Project || $owner instanceof Task
            ? ($this->user() !== null && $this->user()->can('create', [Message::class, $owner]))
            : false;
    }

    public function rules(): array
    {
        return [
            'message_body' => ['required', 'string'],
        ];
    }
}
