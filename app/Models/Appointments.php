<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $school_name
 * @property \Illuminate\Support\Carbon|string|null $appointment_date
 * @property int $file_count
 * @property string $status
 * @property int $assigned_by
 */
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
     * This will be automatically split across multiple days (200 files per day)
     */
    const MAX_FILES_PER_APPOINTMENT = 10000;

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

    /**
     * Boot the model and add mutator to ensure daily_file_count never exceeds DAILY_FILE_LIMIT
     */
    protected static function boot()
    {
        parent::boot();

        // Ensure daily_file_count is always capped at DAILY_FILE_LIMIT (200)
        static::saving(function ($appointment) {
            if ($appointment->daily_file_count !== null) {
                $appointment->daily_file_count = min($appointment->daily_file_count, self::DAILY_FILE_LIMIT);
            }
        });
    }

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
