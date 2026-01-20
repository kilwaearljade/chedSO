<?php

namespace App\Listeners;

use App\Events\AppointmentCreated;
use App\Models\Notification;
use App\Models\User;

class NotifyAppointmentCreated
{
    public function handle(AppointmentCreated $event): void
    {
        $appointment = $event->appointment;
        $user = User::find($appointment->assigned_by);

        // Notify all admins about new appointment
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'appointment_pending',
                'title' => $event->title,
                'message' => "New appointment request from {$user?->name}: {$appointment->school_name}",
                'notifiable_type' => 'App\\Models\\Appointments',
                'notifiable_id' => $appointment->id,
                'data' => [
                    'appointment_id' => $appointment->id,
                    'school_name' => $appointment->school_name,
                    'appointment_date' => $appointment->appointment_date,
                    'reason' => $appointment->reason,
                    'requested_by' => $user?->name,
                    'requested_by_id' => $user?->id,
                    'status' => $appointment->status,
                ],
            ]);
        }
    }
}
