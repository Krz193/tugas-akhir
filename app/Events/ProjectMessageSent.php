<?php

namespace App\Events;

use App\Models\ProjectMessage;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(public ProjectMessage $projectMessage)
    {
        $this->projectMessage->loadMissing(['sender.role', 'sender.division']);
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('projects.'.$this->projectMessage->project_id);
    }

    public function broadcastAs(): string
    {
        return 'project.message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => $this->projectMessage,
        ];
    }
}
