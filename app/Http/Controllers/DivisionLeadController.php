<?php

namespace App\Http\Controllers;

use App\Http\Requests\Division\UpdateDivisionLeadRequest;
use App\Models\Division;
use Illuminate\Http\RedirectResponse;

class DivisionLeadController extends Controller
{
    /** Update division lead assignment (PM only). */
    public function update(UpdateDivisionLeadRequest $request, Division $division): RedirectResponse
    {
        $division->fill([
            'lead_user_id' => $request->validated('lead_user_id'),
        ]);
        $division->save();

        return back()->with('success', 'Division lead updated successfully.');
    }
}
