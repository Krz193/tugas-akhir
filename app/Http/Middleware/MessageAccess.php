<?php

namespace App\Http\Middleware;

use App\Models\Message;
use App\Models\Project;
use App\Models\Task;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MessageAccess
{
    public function handle(Request $request, Closure $next, string $parameter = 'message'): Response
    {
        $message = $request->route($parameter);

        if (! $message instanceof Message) {
            abort(403);
        }

        $owner = $message->messageable;

        $allowed = match (true) {
            $owner instanceof Project => $request->user()?->isProjectMember($owner) ?? false,
            $owner instanceof Task => $request->user()?->isProjectMember($owner->project) ?? false,
            default => false,
        };

        if (! $allowed) {
            abort(403);
        }

        return $next($request);
    }
}
