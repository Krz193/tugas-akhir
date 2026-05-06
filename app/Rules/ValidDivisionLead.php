<?php

namespace App\Rules;

use App\Models\Division;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidDivisionLead implements ValidationRule
{
    public function __construct(protected Division $division)
    {
    }

    /**
     * Ensure selected division lead belongs to the same division and is not PM.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null || $value === '') {
            return;
        }

        $candidate = User::query()->with('role')->find($value);

        if (! $candidate) {
            $fail('The selected lead user is invalid.');

            return;
        }

        if (! $candidate->canLeadDivision($this->division)) {
            if ((int) $candidate->division_id !== (int) $this->division->id) {
                $fail('The selected lead must belong to the same division.');

                return;
            }

            $fail('Project Manager cannot be assigned as division lead.');
        }
    }
}
