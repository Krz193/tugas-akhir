<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Message;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\ProjectMessage;
use App\Models\Role;
use App\Models\Task;
use App\Models\Thread;
use App\Models\User;
use Illuminate\Broadcasting\BroadcastManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageFlowFinalTest extends TestCase
{
    use RefreshDatabase;

    public function test_business_developer_project_member_can_create_project_message(): void
    {
        $member = $this->createUserWithRole('business-developer');
        $project = $this->createProjectWithMember($member->employee);

        $this->actingAs($member)
            ->post(route('projects.messages.store', $project), [
                'message_body' => 'Project message',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('message_project', [
            'project_id' => $project->id,
            'sender_id' => $member->employee->id,
            'message_body' => 'Project message',
        ]);
    }

    public function test_project_messages_are_flat_project_message_records(): void
    {
        $member = $this->createUserWithRole('business-developer');
        $project = $this->createProjectWithMember($member->employee);

        ProjectMessage::query()->create([
            'project_id' => $project->id,
            'sender_id' => $member->employee->id,
            'message_body' => 'Flat project message',
        ]);

        $this->actingAs($member)
            ->get(route('projects.messages.index', $project))
            ->assertOk()
            ->assertJsonPath('data.0.message_body', 'Flat project message')
            ->assertJsonMissingPath('data.0.replies')
            ->assertJsonMissingPath('data.0.parent_id');
    }

    public function test_task_message_creates_thread_and_message(): void
    {
        $member = $this->createUserWithRole('team-member');
        $project = $this->createProjectWithMember($member->employee);
        $task = $this->createTask($project, $member->employee);

        $this->actingAs($member)
            ->post(route('tasks.messages.store', $task), [
                'message_body' => 'Task message',
            ])
            ->assertRedirect();

        $thread = Thread::query()->where('task_id', $task->id)->first();

        $this->assertNotNull($thread);
        $this->assertDatabaseHas('messages', [
            'thread_id' => $thread->id,
            'sender_id' => $member->employee->id,
            'message_body' => 'Task message',
        ]);
    }

    public function test_task_messages_are_flat_thread_messages(): void
    {
        $member = $this->createUserWithRole('team-member');
        $project = $this->createProjectWithMember($member->employee);
        $task = $this->createTask($project, $member->employee);
        $thread = Thread::query()->create(['task_id' => $task->id]);

        Message::query()->create([
            'thread_id' => $thread->id,
            'sender_id' => $member->employee->id,
            'message_body' => 'Flat task message',
        ]);

        $this->actingAs($member)
            ->get(route('tasks.messages.index', $task))
            ->assertOk()
            ->assertJsonPath('data.0.message_body', 'Flat task message')
            ->assertJsonMissingPath('data.0.replies')
            ->assertJsonMissingPath('data.0.parent_id');
    }

    public function test_project_message_channel_uses_project_access_rules(): void
    {
        $this->useReverbForChannelAuth();

        $projectManager = $this->createUserWithRole('project-manager');
        $businessDeveloper = $this->createUserWithRole('business-developer');
        $project = $this->createProjectWithMember($businessDeveloper->employee);

        $this->actingAs($projectManager)
            ->post('/broadcasting/auth', [
                'channel_name' => 'private-projects.'.$project->id,
                'socket_id' => '123.456',
            ])
            ->assertOk();

        $this->actingAs($businessDeveloper)
            ->post('/broadcasting/auth', [
                'channel_name' => 'private-projects.'.$project->id,
                'socket_id' => '123.456',
            ])
            ->assertOk();
    }

    public function test_task_message_channel_uses_task_access_rules(): void
    {
        $this->useReverbForChannelAuth();

        $projectManager = $this->createUserWithRole('project-manager');
        $member = $this->createUserWithRole('team-member');
        $project = $this->createProjectWithMember($member->employee);
        $task = $this->createTask($project, $member->employee);

        $this->actingAs($projectManager)
            ->post('/broadcasting/auth', [
                'channel_name' => 'private-tasks.'.$task->id,
                'socket_id' => '123.456',
            ])
            ->assertOk();

        $this->actingAs($member)
            ->post('/broadcasting/auth', [
                'channel_name' => 'private-tasks.'.$task->id,
                'socket_id' => '123.456',
            ])
            ->assertOk();
    }

    public function test_business_developer_cannot_authorize_task_message_channel(): void
    {
        $this->useReverbForChannelAuth();

        $businessDeveloper = $this->createUserWithRole('business-developer');
        $member = $this->createUserWithRole('team-member');
        $project = $this->createProjectWithMember($businessDeveloper->employee);
        $task = $this->createTask($project, $member->employee);

        $this->actingAs($businessDeveloper)
            ->post('/broadcasting/auth', [
                'channel_name' => 'private-tasks.'.$task->id,
                'socket_id' => '123.456',
            ])
            ->assertForbidden();
    }

    private function useReverbForChannelAuth(): void
    {
        config([
            'broadcasting.default' => 'reverb',
            'broadcasting.connections.reverb.key' => 'local',
            'broadcasting.connections.reverb.secret' => 'local',
            'broadcasting.connections.reverb.app_id' => 'local',
        ]);

        $this->app->make(BroadcastManager::class)->forgetDrivers();

        require base_path('routes/channels.php');
    }

    private function createTask(Project $project, Employee $assignee): Task
    {
        return Task::query()->create([
            'project_id' => $project->id,
            'assigned_employee_id' => $assignee->id,
            'title' => 'Message task',
            'status' => 'todo',
        ]);
    }

    private function createProjectWithMember(Employee $employee): Project
    {
        $project = Project::query()->create(['name' => 'Message Project', 'status' => 'planning']);
        $this->addMember($project, $employee);

        return $project;
    }

    private function addMember(Project $project, Employee $employee): void
    {
        ProjectMember::query()->create([
            'project_id' => $project->id,
            'employee_id' => $employee->id,
            'date_joined' => now(),
            'is_leader' => false,
        ]);
    }

    private function createUserWithRole(string $roleSlug): User
    {
        $role = Role::query()->firstOrCreate(
            ['slug' => $roleSlug],
            ['name' => str($roleSlug)->replace('-', ' ')->title()]
        );

        $user = User::factory()->create();

        Employee::factory()->create([
            'user_id' => $user->id,
            'role_id' => $role->id,
        ]);

        return $user->load('employee.role');
    }
}
