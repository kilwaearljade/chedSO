<?php

namespace App\Events;

use App\Models\Appointments;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $appointment;
    public $message;
    public $title;

    public function __construct(Appointments $appointment, $message = null)
    {
        $this->appointment = $appointment;
        $this->title = 'New Appointment Pending';
        $this->message = $message ?? 'A new appointment has been requested and is pending approval.';
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('notifications.admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'appointment.created';
    }
}
