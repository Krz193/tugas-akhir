<?php

namespace App\Http\Requests\Message;

use App\Models\Message;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Message $message */
        $message = $this->route('message');

        return $this->user() !== null && $this->user()->can('update', $message);
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string'],
        ];
    }
}
