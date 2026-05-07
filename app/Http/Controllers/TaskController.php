<?php

namespace App\Http\Controllers;

use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Requests\Task\UpdateTaskStatusRequest;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class TaskController extends Controller
{
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
