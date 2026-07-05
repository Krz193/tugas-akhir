<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageThreadTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_thread_returns_nested_messages(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $member = User::factory()->create();

        $project = Project::query()->create([
            'created_by' => $pm->id,
            'name' => 'Thread Project',
            'status' => 'planning',
        ]);

        ProjectMember::query()->create([
            'project_id' => $project->id,
            'user_id' => $member->id,
            'added_by' => $pm->id,
            'joined_at' => now(),
        ]);

        $parent = Message::query()->create([
            'user_id' => $pm->id,
            'messageable_type' => Project::class,
            'messageable_id' => $project->id,
            'body' => 'parent',
        ]);

        Message::query()->create([
            'user_id' => $member->id,
            'messageable_type' => Project::class,
            'messageable_id' => $project->id,
            'parent_id' => $parent->id,
            'body' => 'child',
        ]);

        $this->actingAs($member)
            ->get(route('projects.messages.index', $project))
            ->assertOk()
            ->assertJsonPath('data.0.body', 'parent')
            ->assertJsonPath('data.0.replies.0.body', 'child');
    }

    public function test_reply_parent_must_match_thread_context(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);

        $projectA = Project::query()->create(['created_by' => $pm->id, 'name' => 'A', 'status' => 'planning']);
        $projectB = Project::query()->create(['created_by' => $pm->id, 'name' => 'B', 'status' => 'planning']);

        $parentInA = Message::query()->create([
            'user_id' => $pm->id,
            'messageable_type' => Project::class,
            'messageable_id' => $projectA->id,
            'body' => 'parent A',
        ]);

        $this->actingAs($pm)
            ->post(route('projects.messages.store', $projectB), [
                'body' => 'invalid reply',
                'parent_id' => $parentInA->id,
            ])
            ->assertRedirect()
            ->assertSessionHasErrors('parent_id');
    }

    public function test_store_project_message_creates_message(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'E', 'status' => 'planning']);

        $this->actingAs($pm)
            ->post(route('projects.messages.store', $project), [
                'body' => 'Test message',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('messages', [
            'user_id' => $pm->id,
            'messageable_type' => Project::class,
            'messageable_id' => $project->id,
            'body' => 'Test message',
        ]);
    }

    public function test_pm_can_delete_others_message(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $memberRole = Role::query()->create(['name' => 'Team Member', 'slug' => 'team-member']);

        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $member = User::factory()->create(['role_id' => $memberRole->id]);

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'C', 'status' => 'planning']);
        ProjectMember::query()->create([
            'project_id' => $project->id,
            'user_id' => $member->id,
            'added_by' => $pm->id,
            'joined_at' => now(),
        ]);

        $message = Message::query()->create([
            'user_id' => $member->id,
            'messageable_type' => Project::class,
            'messageable_id' => $project->id,
            'body' => 'member msg',
        ]);

        $this->actingAs($pm)
            ->delete(route('messages.destroy', $message))
            ->assertRedirect();

        $this->assertDatabaseMissing('messages', ['id' => $message->id]);
    }

    public function test_author_can_delete_own_message(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $memberRole = Role::query()->create(['name' => 'Team Member', 'slug' => 'team-member']);

        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $member = User::factory()->create(['role_id' => $memberRole->id]);

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'F', 'status' => 'planning']);
        ProjectMember::query()->create([
            'project_id' => $project->id,
            'user_id' => $member->id,
            'added_by' => $pm->id,
            'joined_at' => now(),
        ]);

        $message = Message::query()->create([
            'user_id' => $member->id,
            'messageable_type' => Project::class,
            'messageable_id' => $project->id,
            'body' => 'member msg',
        ]);

        $this->actingAs($member)
            ->delete(route('messages.destroy', $message))
            ->assertRedirect();

        $this->assertDatabaseMissing('messages', ['id' => $message->id]);
    }

    public function test_non_author_non_pm_cannot_delete_other_message(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $memberRole = Role::query()->create(['name' => 'Team Member', 'slug' => 'team-member']);

        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $memberA = User::factory()->create(['role_id' => $memberRole->id]);
        $memberB = User::factory()->create(['role_id' => $memberRole->id]);

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'D', 'status' => 'planning']);

        foreach ([$memberA, $memberB] as $member) {
            ProjectMember::query()->create([
                'project_id' => $project->id,
                'user_id' => $member->id,
                'added_by' => $pm->id,
                'joined_at' => now(),
            ]);
        }

        $message = Message::query()->create([
            'user_id' => $memberA->id,
            'messageable_type' => Project::class,
            'messageable_id' => $project->id,
            'body' => 'member A msg',
        ]);

        $this->actingAs($memberB)
            ->delete(route('messages.destroy', $message))
            ->assertForbidden();

        $this->assertDatabaseHas('messages', ['id' => $message->id]);
    }

    public function test_task_thread_returns_nested_messages(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $member = User::factory()->create();

        $project = Project::query()->create([
            'created_by' => $pm->id,
            'name' => 'Task Thread Project',
            'status' => 'planning',
        ]);

        ProjectMember::query()->create([
            'project_id' => $project->id,
            'user_id' => $member->id,
            'added_by' => $pm->id,
            'joined_at' => now(),
        ]);

        $task = Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'title' => 'Task with messages',
            'status' => 'todo',
        ]);

        $parent = Message::query()->create([
            'user_id' => $pm->id,
            'messageable_type' => Task::class,
            'messageable_id' => $task->id,
            'body' => 'task parent',
        ]);

        Message::query()->create([
            'user_id' => $member->id,
            'messageable_type' => Task::class,
            'messageable_id' => $task->id,
            'parent_id' => $parent->id,
            'body' => 'task child',
        ]);

        $this->actingAs($member)
            ->get(route('tasks.messages.index', $task))
            ->assertOk()
            ->assertJsonPath('data.0.body', 'task parent')
            ->assertJsonPath('data.0.replies.0.body', 'task child');
    }

    public function test_store_task_message_creates_message(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'Task Store Project', 'status' => 'planning']);
        $task = Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'title' => 'Task for messages',
            'status' => 'todo',
        ]);

        $this->actingAs($pm)
            ->post(route('tasks.messages.store', $task), [
                'body' => 'Task message',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('messages', [
            'user_id' => $pm->id,
            'messageable_type' => Task::class,
            'messageable_id' => $task->id,
            'body' => 'Task message',
        ]);
    }

    public function test_task_reply_parent_must_match_thread_context(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'Task Context Project', 'status' => 'planning']);
        
        $taskA = Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'title' => 'Task A',
            'status' => 'todo',
        ]);

        $taskB = Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'title' => 'Task B',
            'status' => 'todo',
        ]);

        $parentInA = Message::query()->create([
            'user_id' => $pm->id,
            'messageable_type' => Task::class,
            'messageable_id' => $taskA->id,
            'body' => 'parent task A',
        ]);

        $this->actingAs($pm)
            ->post(route('tasks.messages.store', $taskB), [
                'body' => 'invalid task reply',
                'parent_id' => $parentInA->id,
            ])
            ->assertRedirect()
            ->assertSessionHasErrors('parent_id');
    }

    public function test_update_message_returns_redirect(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $pm = User::factory()->create(['role_id' => $pmRole->id]);

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'Update Project', 'status' => 'planning']);

        $message = Message::query()->create([
            'user_id' => $pm->id,
            'messageable_type' => Project::class,
            'messageable_id' => $project->id,
            'body' => 'original body',
        ]);

        $this->actingAs($pm)
            ->patch(route('messages.update', $message), [
                'body' => 'updated body',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'body' => 'updated body',
        ]);
    }

    public function test_author_can_update_own_message(): void
    {
        $memberRole = Role::query()->create(['name' => 'Team Member', 'slug' => 'team-member']);
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        
        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $member = User::factory()->create(['role_id' => $memberRole->id]);

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'Member Update Project', 'status' => 'planning']);
        ProjectMember::query()->create([
            'project_id' => $project->id,
            'user_id' => $member->id,
            'added_by' => $pm->id,
            'joined_at' => now(),
        ]);

        $message = Message::query()->create([
            'user_id' => $member->id,
            'messageable_type' => Project::class,
            'messageable_id' => $project->id,
            'body' => 'member original',
        ]);

        $this->actingAs($member)
            ->patch(route('messages.update', $message), [
                'body' => 'member updated',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'body' => 'member updated',
        ]);
    }

    public function test_pm_can_update_others_message(): void
    {
        $memberRole = Role::query()->create(['name' => 'Team Member', 'slug' => 'team-member']);
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        
        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $member = User::factory()->create(['role_id' => $memberRole->id]);

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'PM Update Project', 'status' => 'planning']);
        ProjectMember::query()->create([
            'project_id' => $project->id,
            'user_id' => $member->id,
            'added_by' => $pm->id,
            'joined_at' => now(),
        ]);

        $message = Message::query()->create([
            'user_id' => $member->id,
            'messageable_type' => Project::class,
            'messageable_id' => $project->id,
            'body' => 'pm will update',
        ]);

        $this->actingAs($pm)
            ->patch(route('messages.update', $message), [
                'body' => 'pm updated',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'body' => 'pm updated',
        ]);
    }

    public function test_non_author_non_pm_cannot_update_other_message(): void
    {
        $memberRole = Role::query()->create(['name' => 'Team Member', 'slug' => 'team-member']);
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        
        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $memberA = User::factory()->create(['role_id' => $memberRole->id]);
        $memberB = User::factory()->create(['role_id' => $memberRole->id]);

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'Forbidden Update Project', 'status' => 'planning']);

        foreach ([$memberA, $memberB] as $member) {
            ProjectMember::query()->create([
                'project_id' => $project->id,
                'user_id' => $member->id,
                'added_by' => $pm->id,
                'joined_at' => now(),
            ]);
        }

        $message = Message::query()->create([
            'user_id' => $memberA->id,
            'messageable_type' => Project::class,
            'messageable_id' => $project->id,
            'body' => 'protected message',
        ]);

        $this->actingAs($memberB)
            ->patch(route('messages.update', $message), [
                'body' => 'attempt update',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'body' => 'protected message',
        ]);
    }

    public function test_deeply_nested_task_thread(): void
    {
        $pmRole = Role::query()->create(['name' => 'Project Manager', 'slug' => 'project-manager']);
        $memberRole = Role::query()->create(['name' => 'Team Member', 'slug' => 'team-member']);

        $pm = User::factory()->create(['role_id' => $pmRole->id]);
        $member1 = User::factory()->create(['role_id' => $memberRole->id]);
        $member2 = User::factory()->create(['role_id' => $memberRole->id]);

        $project = Project::query()->create(['created_by' => $pm->id, 'name' => 'Nested Task Project', 'status' => 'planning']);
        
        $task = Task::query()->create([
            'project_id' => $project->id,
            'created_by' => $pm->id,
            'title' => 'Deep thread task',
            'status' => 'todo',
        ]);

        // Create nested thread: root -> reply -> nested reply
        $root = Message::query()->create([
            'user_id' => $pm->id,
            'messageable_type' => Task::class,
            'messageable_id' => $task->id,
            'body' => 'root message',
        ]);

        $reply = Message::query()->create([
            'user_id' => $member1->id,
            'messageable_type' => Task::class,
            'messageable_id' => $task->id,
            'parent_id' => $root->id,
            'body' => 'first reply',
        ]);

        Message::query()->create([
            'user_id' => $member2->id,
            'messageable_type' => Task::class,
            'messageable_id' => $task->id,
            'parent_id' => $reply->id,
            'body' => 'nested reply',
        ]);

        $response = $this->actingAs($pm)
            ->get(route('tasks.messages.index', $task))
            ->assertOk();

        $response->assertJsonPath('data.0.body', 'root message');
        $response->assertJsonPath('data.0.replies.0.body', 'first reply');
        $response->assertJsonPath('data.0.replies.0.replies.0.body', 'nested reply');
    }
}
