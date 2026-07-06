<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse;

class RoleBasedLoginResponse implements LoginResponse, TwoFactorLoginResponse
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        return redirect($this->redirectPath($request));
    }

    private function redirectPath($request): string
    {
        $roleSlug = $request->user()?->employee?->role?->slug;

        if ($roleSlug === 'team-member') {
            return route('tasks.my', absolute: false);
        }

        return route('dashboard', absolute: false);
    }
}
