<?php

namespace App\Events;

use App\Models\FeedBack;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FeedbackSubmitted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $feedback;
    public $message;
    public $title;

    public function __construct(FeedBack $feedback, $message = null)
    {
        $this->feedback = $feedback;
        $this->title = 'New Feedback Received';
        $this->message = $message ?? 'A school has submitted new feedback.';
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('notifications.admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'feedback.submitted';
    }
}
