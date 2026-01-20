<?php

namespace App\Listeners;

use App\Events\EventCreated;
use App\Models\Notification;
use App\Models\User;

class NotifyEventCreated
{
    public function handle(EventCreated $event): void
    {
        $calendarEvent = $event->event;

        // Notify all users
        $users = User::where('role', '!=', 'admin')->get();
        foreach ($users as $user) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'event_created',
                'title' => $event->title,
                'message' => $event->message,
                'notifiable_type' => 'App\\Models\\CalendarEvents',
                'notifiable_id' => $calendarEvent->id,
                'data' => [
                    'event_id' => $calendarEvent->id,
                    'event_name' => $calendarEvent->event_name,
                    'event_date' => $calendarEvent->event_date,
                    'description' => $calendarEvent->description,
                ],
            ]);
        }

        // Notify all admins
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'event_activity',
                'title' => $event->title,
                'message' => $event->message,
                'notifiable_type' => 'App\\Models\\CalendarEvents',
                'notifiable_id' => $calendarEvent->id,
                'data' => [
                    'event_id' => $calendarEvent->id,
                    'event_name' => $calendarEvent->event_name,
                    'event_date' => $calendarEvent->event_date,
                ],
            ]);
        }
    }
}
