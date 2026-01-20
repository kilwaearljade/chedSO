<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserRegistered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $userRole;
    public $message;
    public $title;

    public function __construct(User $user)
    {
        $this->user = $user;
        $this->userRole = ucfirst($user->role);
        $this->title = 'New User Registration';
        $this->message = "New {$this->userRole} registered: {$user->name}";
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('notifications.admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'user.registered';
    }
}
