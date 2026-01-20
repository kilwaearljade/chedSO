<?php

namespace App\Listeners;

use App\Events\MessageSent;
use App\Models\Notification;
use App\Models\User;

class NotifyMessageSent
{
    public function handle(MessageSent $event): void
    {
        $message = $event->message;

        // Create notification for the message receiver
        Notification::create([
            'user_id' => $message->receiver_id,
            'type' => 'new_message',
            'title' => 'New Message',
            'message' => "New message from {$message->sender->name}",
            'notifiable_type' => 'App\\Models\\Message',
            'notifiable_id' => $message->id,
            'data' => [
                'message_id' => $message->id,
                'sender_id' => $message->sender_id,
                'sender_name' => $message->sender->name,
                'preview' => substr($message->message, 0, 100),
            ],
        ]);

        // Notify all admins about message activity
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'message_activity',
                'title' => 'New Message Activity',
                'message' => "Message sent from {$message->sender->name} to {$message->receiver->name}",
                'notifiable_type' => 'App\\Models\\Message',
                'notifiable_id' => $message->id,
                'data' => [
                    'message_id' => $message->id,
                    'sender_name' => $message->sender->name,
                    'receiver_name' => $message->receiver->name,
                ],
            ]);
        }
    }
}
