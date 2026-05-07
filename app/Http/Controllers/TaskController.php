<?php

namespace App\Http\Controllers;

use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Requests\Task\UpdateTaskStatusRequest;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    /** List tasks assigned to current user with optional filters. */
    public function myTasks(Request $request): JsonResponse
    {
        $validated = Validator::make($request->query(), [
            'status' => ['nullable', 'in:todo,in_progress,done'],
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ])->validate();

        $perPage = (int) ($validated['per_page'] ?? 15);

        $tasks = Task::query()
            ->with(['project:id,name,status', 'creator:id,name,email', 'assignee:id,name,email'])
            ->where('assigned_to', $request->user()->id)
            ->when(
                isset($validated['status']),
                fn ($query) => $query->where('status', $validated['status'])
            )
            ->when(
                isset($validated['project_id']),
                fn ($query) => $query->where('project_id', (int) $validated['project_id'])
            )
            ->orderByRaw('CASE WHEN due_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('due_date')
            ->orderBy('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($tasks);
    }

    /** List tasks for a project accessible by current user. */
    public function index(Project $project): JsonResponse
    {
        Gate::authorize('view', $project);

        $tasks = $project->tasks()
            ->with(['assignee:id,name,email', 'creator:id,name,email'])
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        return response()->json(['data' => $tasks]);
    }

    /** Create task under project. */
    public function store(StoreTaskRequest $request, Project $project): JsonResponse
    {
        $task = Task::query()->create([
            ...$request->validated(),
            'project_id' => $project->id,
            'created_by' => $request->user()->id,
            'status' => 'todo',
            'priority' => $request->validated('priority') ?? 'medium',
            'position' => $request->validated('position') ?? 0,
        ]);

        return response()->json(['data' => $task], 201);
    }

    /** Show single task. */
    public function show(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $task->load(['project:id,name,created_by', 'assignee:id,name,email', 'creator:id,name,email']);

        return response()->json(['data' => $task]);
    }

    /** Update task fields except status. */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $task->fill($request->validated());
        $task->save();

        return response()->json(['data' => $task->fresh()]);
    }

    /** Update task status only. */
    public function updateStatus(UpdateTaskStatusRequest $request, Task $task): JsonResponse
    {
        $status = $request->validated('status');

        $task->forceFill([
            'status' => $status,
            'completed_at' => $status === 'done' ? now() : null,
        ])->save();

        return response()->json(['data' => $task->fresh()]);
    }

    /** Delete task. */
    public function destroy(Task $task): JsonResponse
    {
        Gate::authorize('delete', $task);

        $task->delete();

        return response()->json([], 204);
    }
}
