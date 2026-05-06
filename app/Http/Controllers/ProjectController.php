<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\AddProjectMemberRequest;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProjectController extends Controller
{
    /** List projects accessible by current user. */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Project::class);

        $user = $request->user();

        $projects = Project::query()
            ->withCount(['tasks', 'users'])
            ->when(
                ! $user->isProjectManager(),
                fn ($query) => $query->where(function ($inner) use ($user): void {
                    $inner->where('created_by', $user->id)
                        ->orWhereHas('users', fn ($q) => $q->whereKey($user->id));
                })
            )
            ->latest('id')
            ->get();

        return response()->json(['data' => $projects]);
    }

    /** Store a new project. */
    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = Project::query()->create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'status' => $request->validated('status') ?? 'planning',
        ]);

        return response()->json(['data' => $project], 201);
    }

    /** Show a project with members and task summary. */
    public function show(Project $project): JsonResponse
    {
        Gate::authorize('view', $project);

        $project->load(['creator:id,name,email', 'users:id,name,email']);
        $project->loadCount(['tasks', 'users']);

        return response()->json(['data' => $project]);
    }

    /** Update project data. */
    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $project->fill($request->validated());
        $project->save();

        return response()->json(['data' => $project->fresh()]);
    }

    /** Delete a project. */
    public function destroy(Project $project): JsonResponse
    {
        Gate::authorize('delete', $project);

        $project->delete();

        return response()->json([], 204);
    }

    /** Add member to project. */
    public function addMember(AddProjectMemberRequest $request, Project $project): JsonResponse
    {
        $projectMember = ProjectMember::query()->create([
            'project_id' => $project->id,
            'user_id' => (int) $request->validated('user_id'),
            'added_by' => $request->user()->id,
            'joined_at' => now(),
        ]);

        return response()->json(['data' => $projectMember], 201);
    }

    /** Remove member from project. */
    public function removeMember(Request $request, Project $project, User $user): JsonResponse
    {
        Gate::authorize('manageMembers', $project);

        if ((int) $project->created_by === (int) $user->id) {
            return response()->json([
                'message' => 'Project creator cannot be removed from project membership.'
            ], 422);
        }

        ProjectMember::query()
            ->where('project_id', $project->id)
            ->where('user_id', $user->id)
            ->delete();

        return response()->json([], 204);
    }
}
