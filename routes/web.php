<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
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
});

require __DIR__.'/settings.php';
