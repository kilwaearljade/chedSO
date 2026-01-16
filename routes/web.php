<?php

use App\Http\Controllers\FeedBackController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\SchoolFeedBack;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\SchoolCalendarController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->middleware('guest')->name('home');



// Admin Routes
Route::middleware(['auth', 'verified', 'authorization:admin'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'admin'])->name('dashboard');
    Route::get('calendar', [CalendarController::class, 'index'])->name('calendar');
    Route::get('calendar/events', [CalendarController::class, 'getEventsByDate'])->name('calendar.events');
    Route::post('calendar/events', [CalendarController::class, 'store'])->name('calendar.events.store');
    Route::put('calendar/events/{event}', [CalendarController::class, 'update'])->name('calendar.events.update');
    Route::delete('calendar/events/{event}', [CalendarController::class, 'destroy'])->name('calendar.events.destroy');
    Route::get('appointment', function () {
        return Inertia::render('admin/appointment');
    })->name('appointment');
    Route::get('messages', [MessageController::class, 'index'])->name('messages');
    Route::get('messages/{user}/messages', [MessageController::class, 'getMessages'])->name('messages.get');
    Route::post('messages', [MessageController::class, 'store'])->name('messages.store');
    Route::patch('messages/{user}/read', [MessageController::class, 'markAsRead'])->name('messages.read');
    Route::get('feedback', [FeedBackController::class, 'index'])->name('feedback');
    Route::get('schools', [SchoolController::class, 'index'])->name('schoolslist');
    Route::patch('schools/{user}/approve', [SchoolController::class, 'approve'])->name('schools.approve');
    Route::patch('schools/{user}/decline', [SchoolController::class, 'decline'])->name('schools.decline');
});

// School Routes
Route::middleware(['auth', 'verified', 'authorization:school'])->group(function () {
    Route::get('school/dashboard', function () {
        return Inertia::render('school/dashboard');
    })->name('schooldashboard');
    Route::get('school/calendar', [SchoolCalendarController::class, 'index'])->name('schoolcalendar');
    Route::get('school/calendar/appointments', [SchoolCalendarController::class, 'getAppointmentsByDate'])->name('schoolcalendar.appointments');
    Route::post('school/calendar/appointments', [SchoolCalendarController::class, 'store'])->name('schoolcalendar.appointments.store');
    Route::put('school/calendar/appointments/{appointment}', [SchoolCalendarController::class, 'update'])->name('schoolcalendar.appointments.update');
    Route::delete('school/calendar/appointments/{appointment}', [SchoolCalendarController::class, 'destroy'])->name('schoolcalendar.appointments.destroy');
    Route::get('school/feedback', function () {
        return Inertia::render('school/feedback', [
            'status' => session('status'),
        ]);
    })->name('schoolfeedback');
    Route::post('school/feedback', [SchoolFeedBack::class, 'store'])->name('schoolfeedback.store');
    Route::get('school/messages', [MessageController::class, 'index'])->name('schoolmessages');
    Route::get('school/messages/{user}/messages', [MessageController::class, 'getMessages'])->name('schoolmessages.get');
    Route::post('school/messages', [MessageController::class, 'store'])->name('schoolmessages.store');
    Route::patch('school/messages/{user}/read', [MessageController::class, 'markAsRead'])->name('schoolmessages.read');
    Route::get('waiting', function () {
        return Inertia::render('waitingpage');
    })->name('waiting');
});

require __DIR__.'/settings.php';
