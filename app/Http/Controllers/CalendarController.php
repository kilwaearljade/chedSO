<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvents;  // or CalendarEvents - check your model name
use App\Models\Appointments;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;  // ADD THIS LINE

class CalendarController extends Controller
{
    /**
     * Display the admin calendar page with both events and appointments
     */
    public function index()
    {
        // Get all admin events
        $events = CalendarEvents::orderBy('event_date', 'asc')
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'name' => $event->event_name,
                    'date' => $event->event_date,
                    'description' => $event->description,
                    'color' => $this->getEventColor($event->id),
                ];
            });

        // Get all appointments from all schools
        $appointments = Appointments::with('user:id,name') // Load school name
            ->orderBy('appointment_date', 'asc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'name' => $appointment->school_name,
                    'date' => $appointment->appointment_date->format('Y-m-d'),
                    'description' => $appointment->reason,
                    'status' => $appointment->status,
                    'school_name' => $appointment->user?->name ?? 'Unknown School',
                    'color' => $this->getAppointmentColor($appointment->id),
                ];
            });

        return Inertia::render('admin/calendar', [
            'events' => $events,
            'appointments' => $appointments,
        ]);
    }

    /**
     * Get events for a specific date (optional AJAX endpoint)
     */
    public function getEventsByDate(Request $request)
    {
        $date = $request->input('date');

        $events = CalendarEvents::whereDate('event_date', $date)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'name' => $event->event_name,
                    'date' => $event->event_date->format('Y-m-d'),
                    'description' => $event->description,
                    'color' => $this->getEventColor($event->id),
                ];
            });

        return response()->json($events);
    }

    /**
     * Store a newly created event
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'event_name' => 'required|string|max:255',
                'event_date' => 'required|date',
                'description' => 'nullable|string',
            ]);

            $event = CalendarEvents::create([
                'event_name' => $validated['event_name'],
                'event_date' => $validated['event_date'],
                'description' => $validated['description'] ?? null,
            ]);

            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Event created successfully',
                    'event' => [
                        'id' => $event->id,
                        'name' => $event->event_name,
                        'date' => $event->event_date->format('Y-m-d'),
                        'description' => $event->description,
                    ]
                ]);
            }

            return redirect()->back()->with('success', 'Event created successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $e->errors()
                ], 422);
            }
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error creating event: ' . $e->getMessage());
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create event: ' . $e->getMessage()
                ], 500);
            }
            return redirect()->back()->withErrors(['error' => 'Failed to create event: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified event
     */
    public function update(Request $request, $id)
    {
        $event = CalendarEvents::findOrFail($id);

        $validated = $request->validate([
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $event->update($validated);

        return redirect()->back()->with('success', 'Event updated successfully');
    }

    /**
     * Remove the specified event
     */
    public function destroy($id)
    {
        $event = CalendarEvents::findOrFail($id);
        $event->delete();

        return redirect()->back()->with('success', 'Event deleted successfully');
    }

    /**
     * Delete an appointment (admin can delete any appointment)
     */
    public function destroyAppointment($id)
    {
        $appointment = Appointments::findOrFail($id);
        $appointment->delete();

        return redirect()->back()->with('success', 'Appointment deleted successfully');
    }

    /**
     * Get a color for events based on ID
     */
    private function getEventColor($id)
    {
        $colors = [
            'bg-blue-600',
            'bg-indigo-600',
            'bg-purple-600',
            'bg-pink-600',
        ];

        return $colors[$id % count($colors)];
    }

    /**
     * Get a color for appointments based on ID (different from events)
     */
    private function getAppointmentColor($id)
    {
        $colors = [
            'bg-green-600',
            'bg-emerald-600',
            'bg-teal-600',
            'bg-cyan-600',
        ];

        return $colors[$id % count($colors)];
    }
}
