<?php

namespace App\Http\Controllers;

use App\Models\Appointments;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SchoolCalendarController extends Controller
{
    /**
     * Display the calendar page with appointments
     */
    public function index()
    {
        $appointments = Appointments::where('assigned_by', Auth::id())
            ->orderBy('appointment_date', 'asc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'name' => $appointment->school_name,
                    'date' => $appointment->appointment_date->format('Y-m-d'),
                    'day' => $appointment->appointment_date->format('j'),
                    'description' => $appointment->reason,
                    'status' => $appointment->status,
                    'color' => $this->getAppointmentColor($appointment->id),
                ];
            });

        return Inertia::render('school/calendar', [
            'appointments' => $appointments,
        ]);
    }

    /**
     * Get appointments for a specific date
     */
    public function getAppointmentsByDate(Request $request)
    {
        $date = $request->input('date');
        
        $appointments = Appointments::where('assigned_by', Auth::id())
            ->whereDate('appointment_date', $date)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'name' => $appointment->school_name,
                    'date' => $appointment->appointment_date->format('Y-m-d'),
                    'description' => $appointment->reason,
                    'status' => $appointment->status,
                    'color' => $this->getAppointmentColor($appointment->id),
                ];
            });

        return response()->json($appointments);
    }

    /**
     * Store a newly created appointment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_name' => 'required|string|max:255',
            'appointment_date' => 'required|date',
            'reason' => 'nullable|string',
            'file_count' => 'nullable|integer|min:0',
        ]);

        $appointment = Appointments::create([
            'school_name' => $validated['school_name'],
            'appointment_date' => $validated['appointment_date'],
            'reason' => $validated['reason'] ?? null,
            'file_count' => $validated['file_count'] ?? 0,
            'assigned_by' => Auth::id(),
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'appointment' => [
                'id' => $appointment->id,
                'name' => $appointment->school_name,
                'date' => $appointment->appointment_date->format('Y-m-d'),
                'day' => $appointment->appointment_date->format('j'),
                'description' => $appointment->reason,
                'status' => $appointment->status,
                'color' => $this->getAppointmentColor($appointment->id),
            ],
        ]);
    }

    /**
     * Update the specified appointment
     */
    public function update(Request $request, Appointments $appointment)
    {
        // Check if user owns this appointment
        if ($appointment->assigned_by !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'school_name' => 'required|string|max:255',
            'appointment_date' => 'required|date',
            'reason' => 'nullable|string',
            'file_count' => 'nullable|integer|min:0',
            'status' => 'nullable|in:pending,cancelled,complete',
        ]);

        $appointment->update($validated);

        return response()->json([
            'success' => true,
            'appointment' => [
                'id' => $appointment->id,
                'name' => $appointment->school_name,
                'date' => $appointment->appointment_date->format('Y-m-d'),
                'day' => $appointment->appointment_date->format('j'),
                'description' => $appointment->reason,
                'status' => $appointment->status,
                'color' => $this->getAppointmentColor($appointment->id),
            ],
        ]);
    }

    /**
     * Remove the specified appointment
     */
    public function destroy(Appointments $appointment)
    {
        // Check if user owns this appointment
        if ($appointment->assigned_by !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $appointment->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Get a color for the appointment based on ID
     */
    private function getAppointmentColor($id)
    {
        $colors = [
            'bg-primary',
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-orange-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-red-500',
        ];
        
        return $colors[$id % count($colors)];
    }
}
