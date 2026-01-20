<?php

namespace App\Listeners;

use App\Events\AppointmentConfirmed;
use App\Models\Notification;
use App\Models\User;

class NotifyAppointmentConfirmed
{
    public function handle(AppointmentConfirmed $event): void
    {
        $appointment = $event->appointment;
        $user = User::find($appointment->assigned_by);

        if ($user) {
            // Create notification for the user who requested the appointment
            Notification::create([
                'user_id' => $user->id,
                'type' => 'appointment_confirmed',
                'title' => $event->title,
                'message' => $event->message,
                'notifiable_type' => 'App\\Models\\Appointments',
                'notifiable_id' => $appointment->id,
                'data' => [
                    'appointment_id' => $appointment->id,
                    'school_name' => $appointment->school_name,
                    'appointment_date' => $appointment->appointment_date,
                    'status' => $appointment->status,
                ],
            ]);
        }

        // Notify all admins
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'appointment_activity',
                'title' => 'Appointment Confirmed',
                'message' => "Appointment for {$appointment->school_name} has been confirmed",
                'notifiable_type' => 'App\\Models\\Appointments',
                'notifiable_id' => $appointment->id,
                'data' => [
                    'appointment_id' => $appointment->id,
                    'school_name' => $appointment->school_name,
                    'requested_by' => $user?->name,
                ],
            ]);
        }
    }
}
