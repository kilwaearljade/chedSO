<?php

namespace App\Providers;

use App\Events\AppointmentConfirmed;
use App\Events\AppointmentCreated;
use App\Events\EventCreated;
use App\Events\FeedbackSubmitted;
use App\Events\MessageSent;
use App\Events\UserRegistered;
use App\Listeners\NotifyAppointmentConfirmed;
use App\Listeners\NotifyAppointmentCreated;
use App\Listeners\NotifyEventCreated;
use App\Listeners\NotifyFeedbackSubmitted;
use App\Listeners\NotifyMessageSent;
use App\Listeners\NotifyUserRegistered;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        AppointmentCreated::class => [
            NotifyAppointmentCreated::class,
        ],
        AppointmentConfirmed::class => [
            NotifyAppointmentConfirmed::class,
        ],
        MessageSent::class => [
            NotifyMessageSent::class,
        ],
        EventCreated::class => [
            NotifyEventCreated::class,
        ],
        UserRegistered::class => [
            NotifyUserRegistered::class,
        ],
        FeedbackSubmitted::class => [
            NotifyFeedbackSubmitted::class,
        ],
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }
}
