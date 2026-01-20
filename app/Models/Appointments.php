<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointments extends Model
{
    use SoftDeletes;

    /**
     * Maximum number of files allowed per day in the school calendar
     * This is the daily capacity limit across all schools
     */
    const DAILY_FILE_LIMIT = 200;

    /**
     * Maximum number of files that can be uploaded in a single appointment
     */
    const MAX_FILES_PER_APPOINTMENT = 200;

    protected $fillable = [
        'school_name',
        'appointment_date',
        'file_count',
        'daily_file_count',
        'reason',
        'assigned_by',
        'status',
        'is_split',
        'split_sequence',
        'total_splits',
        'parent_appointment_id',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'deleted_at'       => 'datetime',
        'created_at'       => 'datetime',
        'updated_at'       => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'assigned_by');
    }

    /**
     * Get all of the notifications for the appointment.
     */
    public function notifications()
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }
}
