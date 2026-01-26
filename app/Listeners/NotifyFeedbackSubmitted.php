<?php

namespace App\Listeners;

use App\Events\FeedbackSubmitted;
use App\Models\Notification;
use App\Models\User;

class NotifyFeedbackSubmitted
{
    public function handle(FeedbackSubmitted $event): void
    {
        $feedback = $event->feedback;

        // Notify all admins about new feedback
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'feedback_submitted',
                'title' => $event->title,
                'message' => "New feedback received with {$feedback->rating} star rating",
                'notifiable_type' => 'App\\Models\\FeedBack',
                'notifiable_id' => $feedback->id,
                'data' => [
                    'feedback_id' => $feedback->id,
                    'rating' => $feedback->rating,
                    'comment' => $feedback->comment,
                    'status' => $feedback->status,
                ],
            ]);
        }
    }
}
