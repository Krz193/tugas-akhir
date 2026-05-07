<?php

namespace App\Http\Middleware;

use App\Models\Task;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TaskAccess
{
    /** Ensure the authenticated user can access the task route parameter via project membership. */
    public function handle(Request $request, Closure $next, string $parameter = 'task'): Response
    {
        $task = $request->route($parameter);

        if (! $task instanceof Task || ! $request->user()?->isProjectMember($task->project)) {
            abort(403);
        }

        return $next($request);
    }
}
