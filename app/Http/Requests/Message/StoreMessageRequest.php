<?php

namespace App\Http\Requests\Message;

use App\Models\Message;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'body' => ['required', 'string'],
            'parent_id' => ['nullable', 'integer', Rule::exists(Message::class, 'id')],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $parentId = $this->input('parent_id');

            if ($parentId === null) {
                return;
            }

            $owner = $this->route('project') ?? $this->route('task');
            $expectedType = $owner instanceof Project ? Project::class : Task::class;
            $expectedId = $owner?->id;

            $parent = Message::query()->find($parentId);

            if (! $parent instanceof Message) {
                return;
            }

            $sameContext = $parent->messageable_type === $expectedType
                && (int) $parent->messageable_id === (int) $expectedId;

            if (! $sameContext) {
                $validator->errors()->add('parent_id', 'Reply parent must belong to the same thread context.');
            }
        });
    }
}
