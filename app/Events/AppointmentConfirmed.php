<?php

namespace App\Events;

use App\Models\Appointments;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentConfirmed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $appointment;
    public $message;
    public $title;

    public function __construct(Appointments $appointment, $message = null)
    {
        $this->appointment = $appointment;
        $this->title = 'Appointment Confirmed';
        $this->message = $message ?? 'Your appointment has been confirmed.';
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notifications.user.' . $this->appointment->assigned_by),
            new Channel('notifications.admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'appointment.confirmed';
    }
}
