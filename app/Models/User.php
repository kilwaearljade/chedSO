<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Events\UserRegistered;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Nette\Utils\Image;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property string $role
 * @property bool $is_approve
 * @property string|null $profile_photo_path
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property \Illuminate\Support\Carbon|null $two_factor_confirmed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_approve',
        'profile_photo_path',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_approve' => 'boolean',
        ];
    }

    protected $dispatchesEvents = [
        'created' => UserRegistered::class,
    ];

    public function getProfilePhotoUrlAttribute()
    {
        return asset('storage/' . $this->profile_photo);
    }

    /**
     * Get all notifications for this user
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get unread notifications count
     */
    public function getUnreadNotificationsCount()
    {
        return $this->notifications()->where('is_read', false)->count();
    }
}
