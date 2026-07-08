<?php

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('projects.{projectId}', function (User $user, int $projectId): bool {
    $project = Project::query()->find($projectId);

    if ($project === null) {
        return false;
    }

    return $user->can('view', $project);
});

Broadcast::channel('tasks.{taskId}', function (User $user, int $taskId): bool {
    $task = Task::query()->find($taskId);

    if ($task === null) {
        return false;
    }

    return $user->can('view', $task);
});
