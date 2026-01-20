<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'message';

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'sender_role',
        'receiver_role',
        'message',
        'read_at',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Get all of the notifications for the message.
     */
    public function notifications()
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }
}
