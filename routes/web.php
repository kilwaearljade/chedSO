<?php

use App\Http\Controllers\FeedBackController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\SchoolFeedBack;
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
    Route::get('school/calendar', function () {
        return Inertia::render('school/calendar');
    })->name('schoolcalendar');
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
