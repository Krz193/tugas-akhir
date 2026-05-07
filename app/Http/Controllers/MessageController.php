<?php

namespace App\Http\Controllers;

use App\Http\Requests\Message\StoreMessageRequest;
use App\Http\Requests\Message\UpdateMessageRequest;
use App\Models\Message;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

class MessageController extends Controller
{
    /** List project discussion as nested thread tree. */
    public function indexProject(Project $project): JsonResponse
    {
        Gate::authorize('view', $project);

        $messages = Message::query()
            ->with(['author:id,name,email'])
            ->where('messageable_type', Project::class)
            ->where('messageable_id', $project->id)
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $this->buildThreadTree($messages)]);
    }

    /** List task discussion as nested thread tree. */
    public function indexTask(Task $task): JsonResponse
    {
        Gate::authorize('view', $task);

        $messages = Message::query()
            ->with(['author:id,name,email'])
            ->where('messageable_type', Task::class)
            ->where('messageable_id', $task->id)
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $this->buildThreadTree($messages)]);
    }

    /** Create a message in project thread. */
    public function storeProject(StoreMessageRequest $request, Project $project): JsonResponse
    {
        $message = Message::query()->create([
            'user_id' => $request->user()->id,
            'messageable_type' => Project::class,
            'messageable_id' => $project->id,
            'parent_id' => $request->validated('parent_id'),
            'body' => $request->validated('body'),
        ]);

        return response()->json(['data' => $message->load('author:id,name,email')], 201);
    }

    /** Create a message in task thread. */
    public function storeTask(StoreMessageRequest $request, Task $task): JsonResponse
    {
        $message = Message::query()->create([
            'user_id' => $request->user()->id,
            'messageable_type' => Task::class,
            'messageable_id' => $task->id,
            'parent_id' => $request->validated('parent_id'),
            'body' => $request->validated('body'),
        ]);

        return response()->json(['data' => $message->load('author:id,name,email')], 201);
    }

    /** Update message content. */
    public function update(UpdateMessageRequest $request, Message $message): JsonResponse
    {
        $message->forceFill([
            'body' => $request->validated('body'),
            'edited_at' => now(),
        ])->save();

        return response()->json(['data' => $message->fresh()->load('author:id,name,email')]);
    }

    /** Delete message (author or PM). */
    public function destroy(Message $message): JsonResponse
    {
        Gate::authorize('delete', $message);

        $message->delete();

        return response()->json([], 204);
    }

    /** Build nested thread nodes from flat message collection. */
    protected function buildThreadTree(Collection $messages): array
    {
        $nodes = [];

        foreach ($messages as $message) {
            $node = $message->toArray();
            $node['replies'] = [];
            $nodes[$message->id] = $node;
        }

        $roots = [];

        foreach ($messages as $message) {
            if ($message->parent_id !== null && isset($nodes[$message->parent_id])) {
                $nodes[$message->parent_id]['replies'][] = &$nodes[$message->id];

                continue;
            }

            $roots[] = &$nodes[$message->id];
        }

        return $roots;
    }
}
