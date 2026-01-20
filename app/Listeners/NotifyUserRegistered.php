<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use App\Models\Notification;
use App\Models\User;

class NotifyUserRegistered
{
    public function handle(UserRegistered $event): void
    {
        $user = $event->user;

        // Notify all admins about new registration
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'new_registration',
                'title' => $event->title,
                'message' => $event->message,
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $user->id,
                'data' => [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                    'user_role' => $user->role,
                    'approval_required' => true,
                ],
            ]);
        }
    }
}
