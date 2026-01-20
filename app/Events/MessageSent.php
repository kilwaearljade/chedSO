<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $sender;

    public function __construct(Message $message)
    {
        $this->message = $message;
        $this->sender = $message->sender;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notifications.user.' . $this->message->receiver_id),
            new Channel('notifications.admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }
}
