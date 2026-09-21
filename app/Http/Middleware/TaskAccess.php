<?php

namespace App\Http\Middleware;

use App\Models\Task;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TaskAccess
{
    /** Memastikan user boleh membuka task ini. */
    public function handle(Request $request, Closure $next, string $parameter = 'task'): Response
    {
        $task = $request->route($parameter);
        $user = $request->user();

        if (! $task instanceof Task) {
            abort(403);
        }

        if ($user?->employee?->role?->slug === 'project-manager') {
            return $next($request);
        }

        $employeeId = $user?->employee?->id;
        $project    = $task->project;

        if ($employeeId === null || $project === null || ! $project->members()->where('employee_id', $employeeId)->exists()) {
            abort(403);
        }

        return $next($request);
    }
}
