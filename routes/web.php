<?php

use App\Http\Controllers\SchoolController;
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
    Route::get('dashboard', function () {
        return Inertia::render('admin/dashboard');
    })->name('dashboard');
    Route::get('calendar', function () {
        return Inertia::render('admin/calendar');
    })->name('calendar');
    Route::get('appointment', function () {
        return Inertia::render('admin/appointment');
    })->name('appointment');
    Route::get('messages', function () {
        return Inertia::render('admin/message');
    })->name('messages');
    Route::get('feedback', function () {
        return Inertia::render('admin/feedback');
    })->name('feedback');
    Route::get('schools', [SchoolController::class, 'index'])->name('schoolslist');
    Route::patch('schools/{user}/approve', [SchoolController::class, 'approve'])->name('schools.approve');
    Route::patch('schools/{user}/decline', [SchoolController::class, 'decline'])->name('schools.decline');
});

// School Routes
Route::middleware(['auth', 'verified', 'authorization:school'])->group(function () {
    Route::get('school/dashboard', function () {
        return Inertia::render('school/dashboard');
    })->name('schooldashboard');
    Route::get('school/calendar', function () {
        return Inertia::render('school/calendar');
    })->name('schoolcalendar');
    Route::get('school/feedback', function () {
        return Inertia::render('school/feedback');
    })->name('schoolfeedback');
    Route::get('school/messages', function () {
        return Inertia::render('school/message');
    })->name('schoolmessages');
    Route::get('waiting', function () {
        return Inertia::render('waitingpage');
    })->name('waiting');
});

require __DIR__.'/settings.php';
