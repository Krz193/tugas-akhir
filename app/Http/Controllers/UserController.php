<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Models\Division;
use App\Models\Employee;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureProjectManager($request);

        $users = User::query()
            ->with(['employee.role', 'employee.division'])
            ->latest('id')
            ->get();

        $roles = Role::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        $divisions = Division::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles,
            'divisions' => $divisions,
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated): void {
            $user = User::query()->create([
                'email' => $validated['email'],
                'password' => $validated['password'],
                'email_verified_at' => now(),
            ]);

            Employee::query()->create([
                'user_id' => $user->id,
                'role_id' => $validated['role_id'],
                'division_id' => $validated['division_id'],
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
            ]);
        });

        return redirect()->route('users.index');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($user, $validated): void {
            $userData = [
                'email' => $validated['email'],
            ];

            if (! empty($validated['password'])) {
                $userData['password'] = $validated['password'];
            }

            $user->update($userData);

            $user->employee()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'role_id' => $validated['role_id'],
                    'division_id' => $validated['division_id'],
                    'name' => $validated['name'],
                    'phone' => $validated['phone'] ?? null,
                    'address' => $validated['address'] ?? null,
                ]
            );
        });

        return redirect()->route('users.index');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->ensureProjectManager($request);

        $user->delete();

        return redirect()->route('users.index');
    }

    private function ensureProjectManager(Request $request): void
    {
        if ($request->user()?->employee?->role?->slug !== 'project-manager') {
            abort(403);
        }
    }
}
