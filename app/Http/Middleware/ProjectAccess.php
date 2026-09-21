<?php

namespace App\Http\Middleware;

use App\Models\Project;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ProjectAccess
{
    /** Memastikan user boleh membuka project ini. */
    public function handle(Request $request, Closure $next, string $parameter = 'project'): Response
    {
        $project = $request->route($parameter);
        $user    = $request->user();

        if (! $project instanceof Project) {
            abort(403);
        }

        if ($user?->employee?->role?->slug === 'project-manager') {
            return $next($request);
        }

        $employeeId = $user?->employee?->id;

        if ($employeeId === null || ! $project->members()->where('employee_id', $employeeId)->exists()) {
            abort(403);
        }

        return $next($request);
    }
}
