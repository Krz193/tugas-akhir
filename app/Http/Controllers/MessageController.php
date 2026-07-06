<?php

namespace App\Http\Controllers;

use App\Http\Requests\Message\StoreMessageRequest;
use App\Models\Message;
use App\Models\Project;
use App\Models\ProjectMessage;
use App\Models\Task;
use App\Models\Thread;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class MessageController extends Controller
{
    /** Menampilkan pesan project. */
    public function getMessagesByProject(Project $project): JsonResponse
    {
        Gate::authorize('view', $project);

        $messages = ProjectMessage::query()
            ->with(['sender.role', 'sender.division'])
            ->where('project_id', $project->id)
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $messages]);
    }

    /** Menampilkan pesan pada thread task. */
    public function getMessagesByThread(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $thread = Thread::query()->firstOrCreate([
            'task_id' => $task->id,
        ]);

        $messages = Message::query()
            ->with(['sender.role', 'sender.division'])
            ->where('thread_id', $thread->id)
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $messages]);
    }

    /** Menyimpan pesan project. */
    public function sendProjectMessage(StoreMessageRequest $request, Project $project): RedirectResponse
    {
        ProjectMessage::query()->create([
            'project_id' => $project->id,
            'sender_id' => $this->authenticatedEmployeeId($request),
            'message_body' => $request->validated('message_body'),
        ]);

        return redirect()->back();
    }

    /** Menyimpan pesan task. */
    public function sendTaskMessage(StoreMessageRequest $request, Task $task): RedirectResponse
    {
        $thread = Thread::query()->firstOrCreate([
            'task_id' => $task->id,
        ]);

        Message::query()->create([
            'thread_id' => $thread->id,
            'sender_id' => $this->authenticatedEmployeeId($request),
            'message_body' => $request->validated('message_body'),
        ]);

        return redirect()->back();
    }

    private function authenticatedEmployeeId(StoreMessageRequest $request): int
    {
        $employeeId = $request->user()?->employee?->id;

        if ($employeeId === null) {
            abort(403);
        }

        return (int) $employeeId;
    }
}
