<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CalendarEvents extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'event_name',
        'event_date',
        'description'
    ];

    protected $dates = [
        'event_date' => 'date',
        'deleted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Get all of the notifications for the event.
     */
    public function notifications()
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }
}
