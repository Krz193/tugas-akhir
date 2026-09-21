<?php

namespace App\Http\Controllers;

use App\Exports\DashboardExport;
use App\Models\Employee;
use App\Models\Project;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureCanViewDashboard($request);

        $selectedDate = $request->date('date') ?? today();
        $selectedEmployeeId = $this->selectedTeamMemberId($request);
        
        $startMonthStr = $request->string('start_month')->value();
        $endMonthStr = $request->string('end_month')->value();
        $startDate = $startMonthStr ? Carbon::parse($startMonthStr)->startOfMonth() : null;
        $endDate = $endMonthStr ? Carbon::parse($endMonthStr)->endOfMonth() : null;

        $accessibleProjectIds = $this->accessibleProjectIds($request, $startDate, $endDate);

        return Inertia::render('dashboard', [
            'projectSummary' => $this->getProjectSummary($accessibleProjectIds, $selectedEmployeeId, $startDate, $endDate),
            'metricRecords' => $this->getMetricRecords($accessibleProjectIds, $selectedEmployeeId, $startDate, $endDate),
            'teamMembers' => $this->getTeamMembers(),
            'selectedEmployeeId' => $selectedEmployeeId,
            'recentActivities' => $this->getRecentActivities($accessibleProjectIds),
            'incomingDueTasks' => $this->getIncomingDueTasks($accessibleProjectIds),
            'calendarData' => $this->getCalendarData($accessibleProjectIds),
            'selectedDate' => $selectedDate->toDateString(),
            'deadlinesByDate' => $this->getDeadlinesByDate($accessibleProjectIds, $selectedDate),
            'timelineData' => $this->getTimelineData($accessibleProjectIds),
            'startMonth' => $startMonthStr,
            'endMonth' => $endMonthStr,
        ]);
    }

    public function export(Request $request)
    {
        $this->ensureCanViewDashboard($request);

        $selectedEmployeeId = $this->selectedTeamMemberId($request);
        
        $startMonthStr = $request->string('start_month')->value();
        $endMonthStr = $request->string('end_month')->value();
        $startDate = $startMonthStr ? Carbon::parse($startMonthStr)->startOfMonth() : null;
        $endDate = $endMonthStr ? Carbon::parse($endMonthStr)->endOfMonth() : null;

        $accessibleProjectIds = $this->accessibleProjectIds($request, $startDate, $endDate);

        $data = [
            'projectSummary' => $this->getProjectSummary($accessibleProjectIds, $selectedEmployeeId, $startDate, $endDate),
            'metricRecords' => $this->getMetricRecords($accessibleProjectIds, $selectedEmployeeId, $startDate, $endDate),
        ];

        return Excel::download(new DashboardExport($data), 'dashboard_metrics.xlsx');
    }

    private function accessibleProjectIds(Request $request, $startDate = null, $endDate = null)
    {
        $user = $request->user();
        $employeeId = $user?->employee?->id;
        $hasGlobalDashboardAccess = in_array(
            $user?->employee?->role?->slug,
            ['project-manager', 'business-developer'],
            true,
        );

        $projectsQuery = Project::query();

        if (! $hasGlobalDashboardAccess) {
            $projectsQuery->whereHas('members', function ($memberQuery) use ($employeeId): void {
                $memberQuery->where('employee_id', $employeeId);
            });
        }

        $projectsQuery = $this->applyMonthFilter($projectsQuery, $startDate, $endDate);

        return $projectsQuery->pluck('id');
    }

    private function applyMonthFilter($query, $startDate, $endDate)
    {
        if ($startDate && $endDate) {
            $query->where(function ($q) use ($startDate, $endDate) {
                // start_date <= endDate
                $q->where(function ($sub) use ($endDate) {
                    $sub->whereNotNull('start_date')
                        ->whereDate('start_date', '<=', $endDate);
                })->orWhere(function ($sub) use ($endDate) {
                    $sub->whereNull('start_date')
                        ->whereDate('created_at', '<=', $endDate);
                });
            })->where(function ($q) use ($startDate) {
                // due_date >= startDate or due_date is null
                $q->whereNull('due_date')
                  ->orWhereDate('due_date', '>=', $startDate);
            });
        }
        return $query;
    }

    private function ensureCanViewDashboard(Request $request): void
    {
        $roleSlug = $request->user()?->employee?->role?->slug;

        if (! in_array($roleSlug, ['project-manager', 'business-developer'], true)) {
            abort(403);
        }
    }

    private function selectedTeamMemberId(Request $request): ?int
    {
        $employeeId = $request->integer('employee_id');

        if (! $employeeId) {
            return null;
        }

        $isTeamMember = Employee::query()
            ->whereKey($employeeId)
            ->whereHas('role', function ($roleQuery): void {
                $roleQuery->where('slug', 'team-member');
            })
            ->exists();

        return $isTeamMember ? $employeeId : null;
    }

    private function taskMetricQuery($projectIds, ?int $selectedEmployeeId, $startDate = null, $endDate = null)
    {
        $query = Task::query()
            ->whereIn('project_id', $projectIds);

        if ($selectedEmployeeId) {
            $query->where('assigned_employee_id', $selectedEmployeeId);
        }

        $query = $this->applyMonthFilter($query, $startDate, $endDate);

        return $query;
    }

    public function getProjectSummary($projectIds, ?int $selectedEmployeeId = null, $startDate = null, $endDate = null): array
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
            'overdueProject' => Project::query()
                ->whereIn('id', $projectIds)
                ->where('status', '!=', 'completed')
                ->whereDate('due_date', '<', $today)
                ->count(),
            'totalTask' => $this->taskMetricQuery($projectIds, $selectedEmployeeId, $startDate, $endDate)
                ->count(),
            'unfinishedTask' => $this->taskMetricQuery($projectIds, $selectedEmployeeId, $startDate, $endDate)
                ->where('status', '!=', 'done')
                ->count(),
            'overdueTask' => $this->taskMetricQuery($projectIds, $selectedEmployeeId, $startDate, $endDate)
                ->where('status', '!=', 'done')
                ->whereDate('due_date', '<', $today)
                ->count(),
        ];
    }

    private function getMetricRecords($projectIds, ?int $selectedEmployeeId = null, $startDate = null, $endDate = null): array
    {
        $today = today();

        return [
            'totalProject' => $this->projectMetricRecords(
                Project::query()
                    ->whereIn('id', $projectIds)
                    ->orderBy('name')
                    ->get()
            ),
            'activeProject' => $this->projectMetricRecords(
                Project::query()
                    ->whereIn('id', $projectIds)
                    ->where('status', 'active')
                    ->orderBy('name')
                    ->get()
            ),
            'overdueProject' => $this->projectMetricRecords(
                Project::query()
                    ->whereIn('id', $projectIds)
                    ->where('status', '!=', 'completed')
                    ->whereDate('due_date', '<', $today)
                    ->orderBy('due_date')
                    ->get()
            ),
            'totalTask' => $this->taskMetricRecords(
                $this->taskMetricQuery($projectIds, $selectedEmployeeId, $startDate, $endDate)
                    ->with(['project', 'assignee'])
                    ->orderBy('title')
                    ->get()
            ),
            'unfinishedTask' => $this->taskMetricRecords(
                $this->taskMetricQuery($projectIds, $selectedEmployeeId, $startDate, $endDate)
                    ->with(['project', 'assignee'])
                    ->where('status', '!=', 'done')
                    ->orderBy('due_date')
                    ->get()
            ),
            'overdueTask' => $this->taskMetricRecords(
                $this->taskMetricQuery($projectIds, $selectedEmployeeId, $startDate, $endDate)
                    ->with(['project', 'assignee'])
                    ->where('status', '!=', 'done')
                    ->whereDate('due_date', '<', $today)
                    ->orderBy('due_date')
                    ->get()
            ),
        ];
    }

    private function projectMetricRecords($projects)
    {
        return $projects->map(function (Project $project): array {
            return [
                'id' => $project->id,
                'name' => $project->name,
                'status' => $project->status,
                'startDate' => $project->start_date?->toDateString(),
                'dueDate' => $project->due_date?->toDateString(),
                'url' => route('projects.show', $project),
            ];
        })->values();
    }

    private function taskMetricRecords($tasks)
    {
        return $tasks->map(function (Task $task): array {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'status' => $task->status,
                'dueDate' => $task->due_date?->toDateString(),
                'projectName' => $task->project?->name ?? 'Unknown Project',
                'assigneeName' => $task->assignee?->name ?? 'Unassigned',
            ];
        })->values();
    }

    private function getTeamMembers()
    {
        return Employee::query()
            ->with(['role', 'division'])
            ->whereHas('role', function ($roleQuery): void {
                $roleQuery->where('slug', 'team-member');
            })
            ->orderBy('name')
            ->get()
            ->map(function (Employee $employee): array {
                return [
                    'id' => $employee->id,
                    'name' => $employee->name,
                    'divisionName' => $employee->division?->name,
                ];
            });
    }

    public function getRecentActivities($projectIds)
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
                    'url' => route('projects.show', $task->project_id),
                ];
            });
    }

    public function getIncomingDueTasks($projectIds)
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
                    'url' => route('projects.show', $task->project_id),
                ];
            });
    }

    public function getCalendarData($projectIds)
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
                    'url' => route('projects.show', $task->project_id),
                ];
            });

        return $projectCalendarItems
            ->concat($taskCalendarItems)
            ->sortBy('date')
            ->values();
    }

    public function getDeadlinesByDate($projectIds, $selectedDate)
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
                    'url' => route('projects.show', $task->project_id),
                ];
            });

        return $projectDeadlines
            ->concat($taskDeadlines)
            ->values();
    }

    public function getTimelineData($projectIds)
    {
        return Project::query()
            ->whereIn('id', $projectIds)
            ->withCount([
                'tasks',
                'tasks as done_tasks_count' => function ($query): void {
                    $query->where('status', 'done');
                },
            ])
            ->orderBy('start_date')
            ->get()
            ->map(function (Project $project): array {
                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'status' => $project->status,
                    'startDate' => $project->start_date?->toDateString(),
                    'dueDate' => $project->due_date?->toDateString(),
                    'progressPercentage' => $project->progress_percentage,
                    'url' => route('projects.show', $project),
                ];
            });
    }
}
