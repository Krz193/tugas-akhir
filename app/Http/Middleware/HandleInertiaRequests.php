<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Template utama untuk halaman Inertia.
     *
     * @var string
     */
    protected $rootView = 'app';

    /** Menentukan versi asset frontend. */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Data bersama untuk semua halaman Inertia.
     *
     * Role dan divisi diambil dari Employee.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user()?->load('employee.role', 'employee.division'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
