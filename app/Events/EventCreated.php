<?php

namespace App\Events;

use App\Models\CalendarEvents;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EventCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $event;
    public $message;
    public $title;

    public function __construct(CalendarEvents $event, $message = null)
    {
        $this->event = $event;
        $this->title = 'New Event Created';
        $this->message = $message ?? 'A new event has been created: ' . $event->event_name;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('notifications.users'),
            new Channel('notifications.admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'event.created';
    }
}
