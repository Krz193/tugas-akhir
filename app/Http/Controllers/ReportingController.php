<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class ReportingController extends Controller
{
    /** Timeline contract: task list across accessible projects with date range filters. */
    public function timeline(Request $request): Response
    {
        $validated = Validator::make($request->query(), [
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'in:todo,in_progress,pending_review,done'],
        ])->validate();

        $tasks = $this->accessibleTaskQuery($request)
            ->with(['project:id,name,status', 'assignee:id,name,email'])
            ->when(isset($validated['project_id']), fn (Builder $q) => $q->where('project_id', (int) $validated['project_id']))
            ->when(isset($validated['status']), fn (Builder $q) => $q->where('status', $validated['status']))
            ->when(isset($validated['start_date']), fn (Builder $q) => $q->whereDate('due_date', '>=', $validated['start_date']))
            ->when(isset($validated['end_date']), fn (Builder $q) => $q->whereDate('due_date', '<=', $validated['end_date']))
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_date')
            ->orderBy('id')
            ->get();

        return Inertia::render('reports/timeline', [
            'tasks' => $tasks,
            'projects' => $this->accessibleProjects($request),
            'filters' => $validated,
            'total' => $tasks->count(),
        ]);
    }

    /** Calendar contract: due-date grouped tasks for calendar rendering. */
    public function calendar(Request $request): Response
    {
        $validated = Validator::make($request->query(), [
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'month' => ['nullable', 'date_format:Y-m'],
        ])->validate();

        $query = $this->accessibleTaskQuery($request)
            ->with(['project:id,name'])
            ->whereNotNull('due_date')
            ->when(isset($validated['project_id']), fn (Builder $q) => $q->where('project_id', (int) $validated['project_id']));

        if (isset($validated['month'])) {
            [$year, $month] = array_map('intval', explode('-', $validated['month']));
            $query->whereYear('due_date', $year)->whereMonth('due_date', $month);
        }

        $tasks = $query->orderBy('due_date')->orderBy('id')->get();

        $grouped = $tasks->groupBy(fn (Task $task) => optional($task->due_date)->format('Y-m-d'))
            ->map(fn ($items, $date) => [
                'date' => $date,
                'tasks' => $items->values(),
            ])
            ->values();

        return Inertia::render('reports/calendar', [
            'days' => $grouped,
            'projects' => $this->accessibleProjects($request),
            'filters' => $validated,
            'daysWithTasks' => $grouped->count(),
            'totalTasks' => $tasks->count(),
        ]);
    }

    /** Performance contract: summary metrics for accessible tasks. */
    public function performance(Request $request): Response
    {
        $validated = Validator::make($request->query(), [
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
        ])->validate();

        $query = $this->accessibleTaskQuery($request)
            ->when(isset($validated['project_id']), fn (Builder $q) => $q->where('project_id', (int) $validated['project_id']));

        $total = (clone $query)->count();
        $todo = (clone $query)->where('status', 'todo')->count();
        $inProgress = (clone $query)->where('status', 'in_progress')->count();
        $pendingReview = (clone $query)->where('status', 'pending_review')->count();
        $done = (clone $query)->where('status', 'done')->count();
        $overdue = (clone $query)
            ->whereIn('status', ['todo', 'in_progress', 'pending_review'])
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', now()->toDateString())
            ->count();

        $completionRate = $total > 0 ? round(($done / $total) * 100, 2) : 0.0;

        return Inertia::render('reports/performance', [
            'metrics' => [
                'total_tasks' => $total,
                'todo_tasks' => $todo,
                'in_progress_tasks' => $inProgress,
                'pending_review_tasks' => $pendingReview,
                'done_tasks' => $done,
                'overdue_tasks' => $overdue,
                'completion_rate' => $completionRate,
            ],
            'projects' => $this->accessibleProjects($request),
            'filters' => $validated,
        ]);
    }

    protected function accessibleTaskQuery(Request $request): Builder
    {
        $user = $request->user();

        return Task::query()->whereHas('project', function (Builder $q) use ($user): void {
            if ($user->isProjectManager()) {
                return;
            }

            $q->where('created_by', $user->id)
                ->orWhereHas('users', fn (Builder $memberQuery) => $memberQuery->whereKey($user->id));
        });
    }

    protected function accessibleProjects(Request $request)
    {
        $user = $request->user();

        return Project::query()
            ->select(['id', 'name', 'status'])
            ->when(! $user->isProjectManager(), function (Builder $query) use ($user): void {
                $query->where('created_by', $user->id)
                    ->orWhereHas('users', fn (Builder $memberQuery) => $memberQuery->whereKey($user->id));
            })
            ->orderBy('name')
            ->get();
    }
}
