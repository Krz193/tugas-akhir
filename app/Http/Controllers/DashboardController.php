<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $selectedDate = $request->date('date') ?? today();
        $accessibleProjectIds = $this->accessibleProjectIds($request);

        return Inertia::render('dashboard', [
            'summary' => $this->projectAndTaskSummary($accessibleProjectIds),
            'recentActivities' => $this->recentTaskActivities($accessibleProjectIds),
            'incomingDueTasks' => $this->incomingDueTasks($accessibleProjectIds),
            'calendarItems' => $this->calendarItems($accessibleProjectIds),
            'selectedDate' => $selectedDate->toDateString(),
            'selectedDateDeadlines' => $this->deadlinesForDate($accessibleProjectIds, $selectedDate),
            'timelineProjects' => $this->timelineProjects($accessibleProjectIds),
        ]);
    }

    private function accessibleProjectIds(Request $request)
    {
        $user = $request->user();
        $employeeId = $user?->employee?->id;
        $isProjectManager = $user?->employee?->role?->slug === 'project-manager';

        $projectsQuery = Project::query();

        if (! $isProjectManager) {
            $projectsQuery->whereHas('members', function ($memberQuery) use ($employeeId): void {
                $memberQuery->where('employee_id', $employeeId);
            });
        }

        return $projectsQuery->pluck('id');
    }

    private function projectAndTaskSummary($projectIds): array
    {
        $today = today();

        return [
            'totalProject' => Project::query()
                ->whereIn('id', $projectIds)
                ->count(),
            'activeProject' => Project::query()
                ->whereIn('id', $projectIds)
                ->where('status', 'active')
                ->count(),
            'completedProject' => Project::query()
                ->whereIn('id', $projectIds)
                ->where('status', 'completed')
                ->count(),
            'overdueProject' => Project::query()
                ->whereIn('id', $projectIds)
                ->where('status', '!=', 'completed')
                ->whereDate('due_date', '<', $today)
                ->count(),
            'totalTask' => Task::query()
                ->whereIn('project_id', $projectIds)
                ->count(),
            'unfinishedTask' => Task::query()
                ->whereIn('project_id', $projectIds)
                ->where('status', '!=', 'done')
                ->count(),
        ];
    }

    private function recentTaskActivities($projectIds)
    {
        return Task::query()
            ->with('project')
            ->whereIn('project_id', $projectIds)
            ->orderByDesc('updated_at')
            ->take(10)
            ->get()
            ->map(function (Task $task): array {
                return [
                    'taskTitle' => $task->title,
                    'projectName' => $task->project?->name ?? 'Unknown Project',
                    'status' => $task->status,
                    'updatedAt' => $task->updated_at,
                    'url' => route('projects.show', [
                        'project' => $task->project_id,
                        'task' => $task->id,
                    ]),
                ];
            });
    }

    private function incomingDueTasks($projectIds)
    {
        $today = today();
        $oneWeekFromToday = today()->addDays(7);

        return Task::query()
            ->with('project')
            ->whereIn('project_id', $projectIds)
            ->where('status', '!=', 'done')
            ->whereDate('due_date', '>=', $today)
            ->whereDate('due_date', '<=', $oneWeekFromToday)
            ->orderBy('due_date')
            ->take(10)
            ->get()
            ->map(function (Task $task): array {
                return [
                    'id' => $task->id,
                    'taskTitle' => $task->title,
                    'projectName' => $task->project?->name ?? 'Unknown Project',
                    'status' => $task->status,
                    'dueDate' => $task->due_date?->toDateString(),
                    'url' => route('projects.show', [
                        'project' => $task->project_id,
                        'task' => $task->id,
                    ]),
                ];
            });
    }

    private function calendarItems($projectIds)
    {
        $projectCalendarItems = Project::query()
            ->whereIn('id', $projectIds)
            ->whereNotNull('due_date')
            ->orderBy('due_date')
            ->get()
            ->map(function (Project $project): array {
                return [
                    'type' => 'project',
                    'title' => $project->name,
                    'date' => $project->due_date?->toDateString(),
                    'status' => $project->status,
                    'url' => route('projects.show', $project),
                ];
            });

        $taskCalendarItems = Task::query()
            ->with('project')
            ->whereIn('project_id', $projectIds)
            ->whereNotNull('due_date')
            ->orderBy('due_date')
            ->get()
            ->map(function (Task $task): array {
                return [
                    'type' => 'task',
                    'title' => $task->title,
                    'projectName' => $task->project?->name ?? 'Unknown Project',
                    'date' => $task->due_date?->toDateString(),
                    'status' => $task->status,
                    'url' => route('projects.show', [
                        'project' => $task->project_id,
                        'task' => $task->id,
                    ]),
                ];
            });

        return $projectCalendarItems
            ->concat($taskCalendarItems)
            ->sortBy('date')
            ->values();
    }

    private function deadlinesForDate($projectIds, $selectedDate)
    {
        $projectDeadlines = Project::query()
            ->whereIn('id', $projectIds)
            ->whereDate('due_date', $selectedDate)
            ->orderBy('name')
            ->get()
            ->map(function (Project $project): array {
                return [
                    'type' => 'project',
                    'title' => $project->name,
                    'status' => $project->status,
                    'url' => route('projects.show', $project),
                ];
            });

        $taskDeadlines = Task::query()
            ->with('project')
            ->whereIn('project_id', $projectIds)
            ->whereDate('due_date', $selectedDate)
            ->orderBy('title')
            ->get()
            ->map(function (Task $task): array {
                return [
                    'type' => 'task',
                    'title' => $task->title,
                    'projectName' => $task->project?->name ?? 'Unknown Project',
                    'status' => $task->status,
                    'url' => route('projects.show', [
                        'project' => $task->project_id,
                        'task' => $task->id,
                    ]),
                ];
            });

        return $projectDeadlines
            ->concat($taskDeadlines)
            ->values();
    }

    private function timelineProjects($projectIds)
    {
        return Project::query()
            ->whereIn('id', $projectIds)
            ->orderBy('start_date')
            ->get()
            ->map(function (Project $project): array {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'status' => $project->status,
                    'startDate' => $project->start_date?->toDateString(),
                    'dueDate' => $project->due_date?->toDateString(),
                    'url' => route('projects.show', $project),
                ];
            });
    }
}
