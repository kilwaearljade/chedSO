<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Accounts extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'accounts';

    // fields you allow mass assignment for
    protected $fillable = [
        'schoolname',
        'email',
        'password',
        'address',
        'status',
    ];

    // hide password when serializing
    protected $hidden = [
        'password',
    ];

    // If you want to automatically cast dates
    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];
}
