<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\AddProjectMemberRequest;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /** List projects accessible by current user — rendered as an Inertia page. */
    public function index(Request $request): Response
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

        // 'projects/index' maps to resources/js/pages/projects/index.tsx
        return Inertia::render('projects/index', [
            'projects' => $projects,
        ]);
    }

    /** Store a new project and redirect back to the list. */
    public function store(StoreProjectRequest $request): RedirectResponse
    {
        Project::query()->create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'status' => $request->validated('status') ?? 'planning',
        ]);

        // Inertia follows this redirect and re-renders the index page
        // with the updated project list automatically.
        return redirect()->route('projects.index');
    }

    /** Show a project detail page with its tasks and members. */
    public function show(Project $project): Response
    {
        Gate::authorize('view', $project);

        $project->load([
            'creator',
            'users.role',
            'tasks' => fn ($q) => $q->with('assignee:id,name')->orderBy('position')->orderBy('id'),
        ]);

        // Combine project creator + members into one list for the assignee dropdown.
        // Both are valid assignees according to StoreTaskRequest validation.
        $assignees = collect([$project->creator])
            ->merge($project->users)
            ->unique('id')
            ->values();

        return Inertia::render('projects/show', [
            'project'   => $project,
            'assignees' => $assignees,
        ]);
    }

    /** Update project data. */
    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $project->fill($request->validated());
        $project->save();

        return response()->json(['data' => $project->fresh()]);
    }

    /** Delete a project and redirect back to the list. */
    public function destroy(Project $project): RedirectResponse
    {
        Gate::authorize('delete', $project);

        $project->delete();

        return redirect()->route('projects.index');
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
