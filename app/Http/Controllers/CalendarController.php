<?php

namespace App\Http\Controllers;

use App\Events\EventCreated;
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
                    'date' => $event->event_date->format('Y-m-d'),
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
                    'date' => \Carbon\Carbon::parse($appointment->appointment_date)->format('Y-m-d'),
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

            // Automatically move appointments on this date to next available date
            $movedAppointments = $this->moveAppointmentsFromEventDate($validated['event_date']);

            // Fire the event created event for real-time notifications
            EventCreated::dispatch($event);

            $successMessage = 'Event created successfully';
            if ($movedAppointments > 0) {
                $successMessage .= ". {$movedAppointments} appointment(s) automatically moved to next available date(s).";
            }

            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => $successMessage,
                    'moved_appointments' => $movedAppointments,
                    'event' => [
                        'id' => $event->id,
                        'name' => $event->event_name,
                        'date' => $event->event_date->format('Y-m-d'),
                        'description' => $event->description,
                    ]
                ]);
            }

            return redirect()->back()->with('success', $successMessage);
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
     * Move appointments from event date to next available date(s)
     */
    private function moveAppointmentsFromEventDate($eventDate)
    {
        $eventDate = \Carbon\Carbon::parse($eventDate);

        // Find all appointments on the event date
        $appointments = Appointments::whereDate('appointment_date', $eventDate)->get();

        if ($appointments->isEmpty()) {
            return 0;
        }

        $movedCount = 0;
        foreach ($appointments as $appointment) {
            // Find next available date for this appointment
            $nextAvailableDate = $this->findNextAvailableDate(
                $eventDate->copy()->addDay(),
                $appointment->daily_file_count
            );

            if ($nextAvailableDate) {
                $appointment->update([
                    'appointment_date' => $nextAvailableDate->format('Y-m-d')
                ]);
                $movedCount++;

                Log::info("Appointment ID {$appointment->id} moved from {$eventDate->format('Y-m-d')} to {$nextAvailableDate->format('Y-m-d')} due to event creation.");
            } else {
                Log::warning("Could not find available date for appointment ID {$appointment->id}. Appointment remains on {$eventDate->format('Y-m-d')}");
            }
        }

        return $movedCount;
    }

    /**
     * Find the next available date that has no events and sufficient capacity
     */
    private function findNextAvailableDate($startDate, $requiredFileCount)
    {
        $currentDate = $startDate->copy();
        $maxSearchDays = 365; // Prevent infinite loop
        $daysSearched = 0;
        $dailyLimit = Appointments::DAILY_FILE_LIMIT;

        while ($daysSearched < $maxSearchDays) {
            // Skip weekends
            if ($currentDate->isWeekend()) {
                $currentDate->addDay();
                $daysSearched++;
                continue;
            }

            // Check if there's an event on this date
            $hasEvent = CalendarEvents::whereDate('event_date', $currentDate)->exists();
            if ($hasEvent) {
                $currentDate->addDay();
                $daysSearched++;
                continue;
            }

            // Check capacity for this date
            $existingFilesCount = Appointments::whereDate('appointment_date', $currentDate)
                ->sum('daily_file_count') ?: 0;

            $availableCapacity = $dailyLimit - $existingFilesCount;

            // If there's enough capacity, return this date
            if ($availableCapacity >= $requiredFileCount) {
                return $currentDate;
            }

            $currentDate->addDay();
            $daysSearched++;
        }

        // If no available date found within search range, return null
        return null;
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
