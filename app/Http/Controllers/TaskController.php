<?php

namespace App\Http\Controllers;

use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Requests\Task\UpdateTaskStatusRequest;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /** Menampilkan task milik user dengan filter. */
    public function getMyTasks(Request $request): Response
    {
        if ($request->user()?->employee?->role?->slug !== 'team-member') {
            abort(403);
        }

        $validated = Validator::make($request->query(), [
            'status' => ['nullable', 'in:todo,in_progress,pending_review,done'],
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ])->validate();

        $perPage = (int) ($validated['per_page'] ?? 25);
        $employeeId = $request->user()->employee?->id;

        $tasksQuery = Task::query()
            ->with(['project:id,name,status', 'assignee.role', 'assignee.division']);

        $projectsQuery = Project::query();

        if ($employeeId === null) {
            $tasksQuery->whereKey([]);
            $projectsQuery->whereKey([]);
        } else {
            $tasksQuery->where('assigned_employee_id', $employeeId);
            $projectsQuery->whereHas(
                'tasks',
                fn ($taskQuery) => $taskQuery->where('assigned_employee_id', $employeeId)
            );
        }

        if (isset($validated['status'])) {
            $tasksQuery->where('status', $validated['status']);
        }

        if (isset($validated['project_id'])) {
            $tasksQuery->where('project_id', (int) $validated['project_id']);
        }

        $tasks = $tasksQuery
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_date')
            ->orderBy('id')
            ->paginate($perPage)
            ->withQueryString();

        $projects = $projectsQuery
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('tasks/my-tasks', [
            'tasks' => $tasks,
            'projects' => $projects,
        ]);
    }

    /** Menampilkan task dalam project yang dapat diakses. */
    public function index(Project $project): JsonResponse
    {
        Gate::authorize('manageTasks', $project);

        $tasks = $project->tasks()
            ->with(['assignee.role', 'assignee.division'])
            ->orderBy('id')
            ->get();

        return response()->json(['data' => $tasks]);
    }

    /** Membuat task dalam project. */
    public function store(StoreTaskRequest $request, Project $project): RedirectResponse
    {
        Task::query()->create([
            ...$request->validated(),
            'project_id' => $project->id,
            'status' => 'todo',
        ]);

        return redirect()->back();
    }

    /** Menampilkan detail task. */
    public function show(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $task->load([
            'project:id,name,status,start_date,due_date',
            'assignee.role',
            'assignee.division',
            'thread.messages.sender',
        ]);

        return response()->json(['data' => $task]);
    }

    /** Mengubah data task selain status. */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $task->fill($request->validated());
        $task->save();

        return response()->json(['data' => $task->fresh()]);
    }

    /** Mengubah status task. */
    public function updateStatus(UpdateTaskStatusRequest $request, Task $task): RedirectResponse
    {
        $status = $request->validated('status');

        $task->update([
            'status' => $status,
        ]);

        return redirect()->back();
    }

    /** Menghapus task. */
    public function destroy(Task $task): RedirectResponse
    {
        Gate::authorize('delete', $task);

        $task->delete();

        return redirect()->back();
    }
}
