<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReportingContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_timeline_returns_accessible_tasks_with_filters(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $member = User::factory()->create();

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'R1', 'status' => 'planning']);
        ProjectMember::query()->create([
            'project_id' => $project->id,
            'user_id' => $member->id,
            'added_by' => $pm->id,
            'joined_at' => now(),
        ]);

        Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'assigned_to' => $member->id,
            'title' => 'Inside range',
            'status' => 'in_progress',
            'priority' => 'medium',
            'due_date' => now()->addDay()->toDateString(),
            'position' => 0,
        ]);

        Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'assigned_to' => $member->id,
            'title' => 'Out of range',
            'status' => 'todo',
            'priority' => 'medium',
            'due_date' => now()->addDays(10)->toDateString(),
            'position' => 1,
        ]);

        $response = $this->actingAs($member)
            ->get(route('reports.timeline', [
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(2)->toDateString(),
                'status' => 'in_progress',
            ]));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('reports/timeline')
                ->has('tasks', 1)
                ->where('tasks.0.title', 'Inside range')
                ->where('total', 1)
            );
    }

    public function test_calendar_groups_tasks_by_due_date(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'R2', 'status' => 'planning']);

        $dueDate = now()->addDay()->toDateString();

        Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'title' => 'Calendar A',
            'status' => 'todo',
            'priority' => 'medium',
            'due_date' => $dueDate,
            'position' => 0,
        ]);

        Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'title' => 'Calendar B',
            'status' => 'done',
            'priority' => 'medium',
            'due_date' => $dueDate,
            'position' => 1,
        ]);

        $response = $this->actingAs($pm)->get(route('reports.calendar'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('reports/calendar')
                ->where('days.0.date', $dueDate)
                ->has('days.0.tasks', 2)
                ->where('totalTasks', 2)
            );
    }

    public function test_performance_returns_summary_metrics(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'R3', 'status' => 'planning']);

        Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'title' => 'Done',
            'status' => 'done',
            'priority' => 'medium',
            'position' => 0,
        ]);

        Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'title' => 'Overdue',
            'status' => 'pending_review',
            'priority' => 'medium',
            'due_date' => now()->subDay()->toDateString(),
            'position' => 1,
        ]);

        $response = $this->actingAs($pm)->get(route('reports.performance'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('reports/performance')
                ->where('metrics.total_tasks', 2)
                ->where('metrics.done_tasks', 1)
                ->where('metrics.pending_review_tasks', 1)
                ->where('metrics.overdue_tasks', 1)
                ->where('metrics.completion_rate', 50)
            );
    }
}
