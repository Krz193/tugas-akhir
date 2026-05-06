<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransferProjectManagerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->isProjectManager();
    }

    public function rules(): array
    {
        return [
            'new_pm_user_id' => [
                'required',
                'integer',
                Rule::exists(User::class, 'id'),
                Rule::notIn([$this->user()?->id]),
            ],
            'reason' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
