<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\AddProjectMemberRequest;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Models\Employee;
use App\Models\Project;
use App\Models\ProjectMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /** Menampilkan project yang dapat diakses user. */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Project::class);

        $user = $request->user();
        $employeeId = $user->employee?->id;

        $projects = Project::query()
            ->withCount(['tasks', 'members'])
            ->when(
                ! $this->isProjectManager($user) && ! $this->isBusinessDeveloper($user),
                fn ($query) => $query->whereHas(
                    'members',
                    fn ($memberQuery) => $memberQuery->where('employee_id', $employeeId)
                )
            )
            ->latest('id')
            ->get();

        return Inertia::render('projects/index', [
            'projects' => $projects,
            'availableEmployees' => $this->getAvailableEmployees(),
        ]);
    }

    /** Menyimpan project baru. */
    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $project = DB::transaction(function () use ($request) {
            $project = Project::query()->create([
                ...$request->safe()->except('member_ids'),
                'status' => $request->validated('status') ?? 'planning',
            ]);

            $memberIds = collect($request->validated('member_ids', []))
                ->map(fn ($memberId) => (int) $memberId)
                ->unique();

            $memberIds->each(fn ($employeeId) => $this->createProjectMember($project, $employeeId));

            return $project;
        });

        return redirect()->route('projects.show', $project);
    }

    /** Menampilkan detail project beserta task dan anggota. */
    public function show(Project $project): Response
    {
        Gate::authorize('view', $project);

        $project->load([
            'members.employee.role',
            'members.employee.division',
            'projectMessages.sender.role',
            'projectMessages.sender.division',
            'tasks' => fn ($q) => $q
                ->with(['assignee.role', 'assignee.division'])
                ->orderBy('id'),
        ]);

        return Inertia::render('projects/show', [
            'project'   => $project,
            'assignees' => $this->getProjectMemberEmployees($project),
            'projectMessages' => $project->projectMessages,
            'availableEmployees' => $this->getAvailableEmployees(),
        ]);
    }

    /** Mengubah data project dan menyamakan anggota. */
    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        DB::transaction(function () use ($request, $project): void {
            $project->fill($request->safe()->except('member_ids'));
            $project->save();

            if ($request->has('member_ids')) {
                $memberIds = collect($request->validated('member_ids', []))
                    ->map(fn ($memberId) => (int) $memberId)
                    ->unique();

                $this->syncProjectMembers($project, $memberIds);
            }
        });

        return redirect()->back();
    }

    /** Menghapus project. */
    public function destroy(Project $project): RedirectResponse
    {
        Gate::authorize('delete', $project);

        $project->delete();

        return redirect()->route('projects.index');
    }

    /** Menambah anggota project. */
    public function addMember(AddProjectMemberRequest $request, Project $project): JsonResponse
    {
        $projectMember = ProjectMember::query()->create([
            'project_id' => $project->id,
            'employee_id' => (int) $request->validated('employee_id'),
            'date_joined' => now(),
            'is_leader' => (bool) $request->validated('is_leader', false),
        ]);

        return response()->json(['data' => $projectMember->load('employee.role', 'employee.division')], 201);
    }

    /** Menghapus anggota project. */
    public function deleteMember(Request $request, Project $project, Employee $employee): JsonResponse
    {
        Gate::authorize('manageMembers', $project);

        ProjectMember::query()
            ->where('project_id', $project->id)
            ->where('employee_id', $employee->id)
            ->delete();

        return response()->json([], 204);
    }

    private function isProjectManager($user): bool
    {
        return $user?->employee?->role?->slug === 'project-manager';
    }

    private function isBusinessDeveloper($user): bool
    {
        return $user?->employee?->role?->slug === 'business-developer';
    }

    private function getAvailableEmployees()
    {
        return Employee::query()
            ->with(['role', 'division'])
            ->whereHas('role', fn ($query) => $query->where('slug', 'team-member'))
            ->orderBy('name')
            ->get();
    }

    private function getProjectMemberEmployees(Project $project)
    {
        return $project->members
            ->pluck('employee')
            ->filter(fn ($employee) => $employee?->role?->slug === 'team-member')
            ->values();
    }

    private function syncProjectMembers(Project $project, $memberIds): void
    {
        $project->members()
            ->whereNotIn('employee_id', $memberIds)
            ->delete();

        $memberIds->each(fn ($employeeId) => ProjectMember::query()->firstOrCreate(
            [
                'project_id' => $project->id,
                'employee_id' => $employeeId,
            ],
            [
                'date_joined' => now(),
                'is_leader' => false,
            ]
        ));
    }

    private function createProjectMember(Project $project, int $employeeId): ProjectMember
    {
        return ProjectMember::query()->create([
            'project_id' => $project->id,
            'employee_id' => $employeeId,
            'date_joined' => now(),
            'is_leader' => false,
        ]);
    }
}
