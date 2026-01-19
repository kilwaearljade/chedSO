<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Message;
use App\Models\Appointments;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SchoolDashboardController extends Controller
{
    /**
     * Display school dashboard with statistics and data.
     */
    public function index(): Response
    {
        $user = Auth::user();

        // Get upcoming appointments for this school
        $upcomingAppointments = Appointments::where('assigned_by', $user->id)
            ->where('appointment_date', '>=', now())
            ->orderBy('appointment_date', 'asc')
            ->take(10)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'title' => $appointment->reason ?: 'Appointment',
                    'date' => $appointment->appointment_date->format('M d, Y'),
                    'time' => $appointment->appointment_date->format('g:i A'),
                    'status' => ucfirst($appointment->status ?? 'Pending'),
                ];
            });

        // Get statistics
        $stats = [
            [
                'label' => 'Upcoming Appointments',
                'value' => Appointments::where('assigned_by', $user->id)
                    ->where('appointment_date', '>=', now())
                    ->count(),
                'icon' => 'Calendar',
            ],
            [
                'label' => 'Pending Documents',
                'value' => Appointments::where('assigned_by', $user->id)
                    ->where('status', 'pending')
                    ->count(),
                'icon' => 'FileText',
            ],
            [
                'label' => 'Unread Messages',
                'value' => Message::where('recipient_id', $user->id)
                    ->where('is_read', false)
                    ->count(),
                'icon' => 'MessageCircle',
            ],
        ];

        return Inertia::render('school/dashboard', [
            'stats' => $stats,
            'upcomingAppointments' => $upcomingAppointments,
        ]);
    }
}
