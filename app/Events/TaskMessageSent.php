<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Message $message,
        public int $taskId,
    ) {
        $this->message->loadMissing(['sender.role', 'sender.division']);
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('tasks.'.$this->taskId);
    }

    public function broadcastAs(): string
    {
        return 'task.message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => $this->message,
        ];
    }
}
