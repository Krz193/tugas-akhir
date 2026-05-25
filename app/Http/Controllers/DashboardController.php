<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Message;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $isProjectManager = $user->role?->slug === 'project-manager';

        /** @var \Illuminate\Database\Eloquent\Builder<Project> $accessibleProjectsQuery */
        $accessibleProjectsQuery = Project::query();

        if (! $isProjectManager) {
            $accessibleProjectsQuery->where(function (Builder $query) use ($user) {
                $query
                    ->where('created_by', $user->id)
                    ->orWhereHas('members', function (Builder $memberQuery) use ($user) {
                        $memberQuery->where('user_id', $user->id);
                    });
            });
        }

        $accessibleProjectIds = (clone $accessibleProjectsQuery)
            ->pluck('id');

        /** @var \Illuminate\Database\Eloquent\Builder<Task> $accessibleTasksQuery */
        $accessibleTasksQuery = Task::query()
            ->whereIn('project_id', $accessibleProjectIds);

        $recentProjectActivities = Project::query()
            ->whereIn('id', $accessibleProjectIds)
            ->latest('updated_at')
            ->take(5)
            ->get()
            ->map(function (Project $project) {
                return [
                    'type' => 'project_updated',
                    'title' => $project->name,
                    'description' => sprintf(
                        '%s was recently updated',
                        $project->name,
                    ),
                    'context' => 'Project Workspace',
                    'url' => route('projects.show', $project),
                    'created_at' => $project->updated_at,
                ];
            });

        $recentTaskActivities = Task::query()
            ->with('project')
            ->whereIn('project_id', $accessibleProjectIds)
            ->latest('updated_at')
            ->take(10)
            ->get()
            ->map(function (Task $task) {
                return [
                    'type' => 'task_updated',
                    'title' => $task->title,
                    'description' => sprintf(
                        'Currently %s on %s',
                        str_replace('_', ' ', $task->status),
                        $task->project?->name ?? 'Unknown Project',
                    ),
                    'context' => 'Task Board',
                    'url' => route('projects.show', [
                        'project' => $task->project_id,
                        'task' => $task->id,
                    ]),
                    'created_at' => $task->updated_at,
                ];
            });

        $recentMessageActivities = Message::query()
            ->with(['author', 'messageable'])
            ->where(function (Builder $query) use ($accessibleProjectIds) {
                $query
                    ->where(function (Builder $projectQuery) use ($accessibleProjectIds) {
                        $projectQuery
                            ->where('messageable_type', Project::class)
                            ->whereIn('messageable_id', $accessibleProjectIds);
                    })
                    ->orWhere(function (Builder $taskQuery) use ($accessibleProjectIds) {
                        $taskQuery
                            ->where('messageable_type', Task::class)
                            ->whereIn(
                                'messageable_id',
                                Task::query()
                                    ->whereIn('project_id', $accessibleProjectIds)
                                    ->pluck('id')
                            );
                    });
            })
            ->latest('created_at')
            ->take(10)
            ->get()
            ->map(function (Message $message) {
                $context = null;
                $url = null;

                if ($message->messageable instanceof Project) {
                    $context = $message->messageable->name;
                    $url = route('projects.show', $message->messageable);
                }

                if ($message->messageable instanceof Task) {
                    $context = $message->messageable->title;
                    $url = route('projects.show', [
                        'project' => $message->messageable->project_id,
                        'task' => $message->messageable->id,
                    ]);
                }

                return [
                    'type' => 'message_posted',
                    'title' => $message->author?->name ?? 'Unknown User',
                    'description' => sprintf(
                        '%s posted a new discussion message',
                        $message->author?->name ?? 'Unknown User',
                    ),
                    'context' => $context,
                    'url' => $url,
                    'created_at' => $message->created_at,
                ];
            });

        $recentActivities = $recentProjectActivities
            ->concat($recentTaskActivities)
            ->concat($recentMessageActivities)
            ->sortByDesc('created_at')
            ->take(10)
            ->values();

        return Inertia::render('dashboard', [
            'stats' => [
                'accessibleProjectsCount' => $accessibleProjectsQuery->count(),
                'assignedTasksCount' => Task::where('assigned_to', $user->id)->count(),
                'pendingReviewTasksCount' => (clone $accessibleTasksQuery)
                    ->where('status', 'pending_review')
                    ->count(),
                'overdueTasksCount' => (clone $accessibleTasksQuery)
                    ->whereNotIn('status', ['done'])
                    ->whereDate('due_date', '<', now())
                    ->count(),
            ],
            'recentActivities' => $recentActivities,
        ]);
    }
}