<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointments extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'school_name',
        'appointment_date',
        'file_count',
        'reason',
        'assigned_by',
        'status',
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
}
