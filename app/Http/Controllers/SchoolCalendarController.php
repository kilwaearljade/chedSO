<?php

namespace App\Http\Controllers;

use App\Models\Appointments;
use App\Models\CalendarEvents;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SchoolCalendarController extends Controller
{
    /**
     * Display the calendar page with appointments and admin events
     */
    public function index()
    {
        // Get school's own appointments (including split appointments)
        $appointments = Appointments::where('assigned_by', Auth::id())
            ->orderBy('appointment_date', 'asc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'name' => $appointment->school_name,
                    'date' => $appointment->appointment_date->format('Y-m-d'),
                    'day' => (int) $appointment->appointment_date->format('j'),
                    'description' => $appointment->reason,
                    'status' => $appointment->status,
                    'file_count' => $appointment->file_count,
                    'daily_file_count' => $appointment->daily_file_count,
                    'is_split' => $appointment->is_split,
                    'split_sequence' => $appointment->split_sequence,
                    'total_splits' => $appointment->total_splits,
                    'parent_appointment_id' => $appointment->parent_appointment_id,
                    'color' => $this->getAppointmentColor($appointment->id),
                ];
            });

        // Get all admin events (schools can view but not edit)
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

        return Inertia::render('school/calendar', [
            'appointments' => $appointments,
            'events' => $events,
        ]);
    }

    /**
     * Get appointments for a specific date (if needed for AJAX calls)
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
                    'day' => (int) $appointment->appointment_date->format('j'),
                    'description' => $appointment->reason,
                    'status' => $appointment->status,
                    'color' => $this->getAppointmentColor($appointment->id),
                ];
            });

        return response()->json($appointments);
    }

    /**
     * Store a newly created appointment with auto-split functionality
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_name' => 'required|string|max:255',
            'appointment_date' => 'required|date',
            'reason' => 'nullable|string',
            'file_count' => 'required|integer|min:1',
        ]);

        $fileCount = $validated['file_count'];
        $startDate = \Carbon\Carbon::parse($validated['appointment_date']);
        $dailyLimit = 200; // Maximum files per day across all schools

        // Calculate how many days needed
        $appointments = [];
        $remainingFiles = $fileCount;
        $currentDate = $startDate->copy();
        $splitSequence = 1;

        // Keep track of the parent appointment ID
        $parentAppointment = null;

        while ($remainingFiles > 0) {
            // Skip weekends
            while ($currentDate->isWeekend()) {
                $currentDate->addDay();
            }

            // Check current capacity for this date
            $existingFilesCount = Appointments::whereDate('appointment_date', $currentDate)
                ->sum('daily_file_count') ?: 0;

            $availableCapacity = $dailyLimit - $existingFilesCount;

            // If no capacity available, move to next day
            if ($availableCapacity <= 0) {
                $currentDate->addDay();
                continue;
            }

            // Calculate files for this day
            $filesForThisDay = min($remainingFiles, $availableCapacity);

            // Create appointment for this day
            $appointment = Appointments::create([
                'school_name' => $validated['school_name'],
                'appointment_date' => $currentDate->format('Y-m-d'),
                'reason' => $validated['reason'] ?? null,
                'file_count' => $fileCount, // Original total
                'daily_file_count' => $filesForThisDay, // Files for this specific day
                'assigned_by' => Auth::id(),
                'status' => 'pending',
                'is_split' => $fileCount > $dailyLimit, // Mark if it's a split appointment
                'split_sequence' => $fileCount > $dailyLimit ? $splitSequence : null,
                'parent_appointment_id' => null, // Will update child appointments
            ]);

            // Set parent appointment (first one created)
            if ($parentAppointment === null) {
                $parentAppointment = $appointment;
            } else {
                // Update child appointments to reference parent
                $appointment->update(['parent_appointment_id' => $parentAppointment->id]);
            }

            $appointments[] = $appointment;
            $remainingFiles -= $filesForThisDay;
            $splitSequence++;
            $currentDate->addDay();
        }

        // Update all appointments with total splits count
        $totalSplits = count($appointments);
        if ($totalSplits > 1) {
            foreach ($appointments as $apt) {
                $apt->update(['total_splits' => $totalSplits]);
            }
        }

        return redirect()->back()->with('success',
            $totalSplits > 1
                ? "Appointment created and split into {$totalSplits} days due to daily capacity limits."
                : 'Appointment created successfully'
        );
    }

    /**
     * Update the specified appointment
     */
    public function update(Request $request, $id)
    {
        $appointment = Appointments::findOrFail($id);

        // Check if user owns this appointment
        if ($appointment->assigned_by !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'school_name' => 'required|string|max:255',
            'appointment_date' => 'required|date',
            'reason' => 'nullable|string',
            'file_count' => 'nullable|integer|min:0',
            'status' => 'nullable|in:pending,cancelled,complete',
        ]);

        $appointment->update($validated);

        return redirect()->back()->with('success', 'Appointment updated successfully');
    }

    /**
     * Remove the specified appointment
     */
    public function destroy($id)
    {
        $appointment = Appointments::findOrFail($id);

        // Check if user owns this appointment
        if ($appointment->assigned_by !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $appointment->delete();

        return redirect()->back()->with('success', 'Appointment deleted successfully');
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

    /**
     * Get a color for events (different from appointments)
     */
    private function getEventColor($id)
    {
        $colors = [
            'bg-cyan-600',
            'bg-teal-600',
            'bg-sky-600',
            'bg-indigo-600',
        ];

        return $colors[$id % count($colors)];
    }
}
