<?php

namespace App\Http\Middleware;

use App\Models\Message;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MessageAccess
{
    /** Memastikan user boleh membuka pesan task ini. */
    public function handle(Request $request, Closure $next, string $parameter = 'message'): Response
    {
        $message = $request->route($parameter);
        $user    = $request->user();

        if (! $message instanceof Message) {
            abort(403);
        }

        if ($user?->employee?->role?->slug === 'project-manager') {
            return $next($request);
        }

        $employeeId = $user?->employee?->id;

        $message->loadMissing('thread.task.project');
        $project = $message->thread?->task?->project;

        if ($employeeId === null || $project === null || ! $project->members()->where('employee_id', $employeeId)->exists()) {
            abort(403);
        }

        return $next($request);
    }
}
