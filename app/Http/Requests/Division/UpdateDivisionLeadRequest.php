<?php

namespace App\Http\Requests\Division;

use App\Models\Division;
use App\Models\User;
use App\Rules\ValidDivisionLead;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDivisionLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Division $division */
        $division = $this->route('division');

        return $this->user() !== null && $this->user()->can('updateLead', $division);
    }

    public function rules(): array
    {
        /** @var Division $division */
        $division = $this->route('division');

        return [
            'lead_user_id' => [
                'nullable',
                'integer',
                Rule::exists(User::class, 'id'),
                Rule::unique('divisions', 'lead_user_id')->ignore($division->id),
                new ValidDivisionLead($division),
            ],
        ];
    }
}
