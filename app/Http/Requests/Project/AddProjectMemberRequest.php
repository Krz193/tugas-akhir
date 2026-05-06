<?php

namespace App\Http\Requests\Project;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AddProjectMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Project $project */
        $project = $this->route('project');

        return $this->user() !== null && $this->user()->can('manageMembers', $project);
    }

    public function rules(): array
    {
        /** @var Project $project */
        $project = $this->route('project');

        return [
            'user_id' => [
                'required',
                'integer',
                Rule::exists(User::class, 'id'),
                Rule::unique('project_members', 'user_id')->where(fn ($q) => $q->where('project_id', $project->id)),
            ],
        ];
    }
}
