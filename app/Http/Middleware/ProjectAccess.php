<?php

namespace App\Http\Middleware;

use App\Models\Project;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ProjectAccess
{
    /** Ensure the authenticated user can access the project route parameter. */
    public function handle(Request $request, Closure $next, string $parameter = 'project'): Response
    {
        $project = $request->route($parameter);

        if (! $project instanceof Project || ! $request->user()?->isProjectMember($project)) {
            abort(403);
        }

        return $next($request);
    }
}
