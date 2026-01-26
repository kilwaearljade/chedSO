<?php

namespace App\Http\Controllers;

use App\Models\Appointments;
use App\Models\CalendarEvents;
use App\Rules\AppointmentDailyCapacityRule;
use App\Rules\ValidAppointmentDate;
use App\Events\AppointmentCreated;
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
        // Get all appointments (including user's own and appointments from other users)
        $appointments = Appointments::orderBy('appointment_date', 'asc')
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
                    'assigned_by' => $appointment->assigned_by,
                ];
            });

        // Get all admin events (schools can view but not edit)
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

        $appointments = Appointments::whereDate('appointment_date', $date)
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
     * Check available capacity for a specific date
     */
    public function checkDateCapacity(Request $request)
    {
        $date = $request->input('date');
        $fileCount = $request->input('file_count', 1);

        if (!$date) {
            return response()->json([
                'available' => false,
                'message' => 'Date is required'
            ], 400);
        }

        $appointmentDate = \Carbon\Carbon::parse($date);
        $today = \Carbon\Carbon::today();

        // Check if date is today or in the past
        if ($appointmentDate->lte($today)) {
            return response()->json([
                'available' => false,
                'capacity_used' => 0,
                'capacity_available' => 0,
                'capacity_total' => Appointments::DAILY_FILE_LIMIT,
                'message' => 'Cannot create appointment for today or past dates.',
                'reason' => 'past_or_today'
            ]);
        }

        // Check if date is weekend
        if ($appointmentDate->isWeekend()) {
            return response()->json([
                'available' => false,
                'capacity_used' => 0,
                'capacity_available' => 0,
                'capacity_total' => Appointments::DAILY_FILE_LIMIT,
                'message' => "Cannot create appointment on {$appointmentDate->format('l')}. Weekends are not allowed.",
                'reason' => 'weekend'
            ]);
        }

        // Check if there's an event on this date
        $event = CalendarEvents::whereDate('event_date', $appointmentDate)->first();
        if ($event) {
            return response()->json([
                'available' => false,
                'capacity_used' => 0,
                'capacity_available' => 0,
                'capacity_total' => Appointments::DAILY_FILE_LIMIT,
                'message' => "Cannot create appointment. Event '{$event->event_name}' is scheduled on this date.",
                'reason' => 'event',
                'event_name' => $event->event_name
            ]);
        }

        // Calculate current capacity
        $existingFilesCount = Appointments::whereDate('appointment_date', $appointmentDate)
            ->sum('daily_file_count') ?: 0;

        $dailyLimit = Appointments::DAILY_FILE_LIMIT;
        $availableCapacity = $dailyLimit - $existingFilesCount;

        // Check if there's enough capacity for the requested files
        $hasCapacity = $availableCapacity >= $fileCount;

        return response()->json([
            'available' => $hasCapacity,
            'capacity_used' => $existingFilesCount,
            'capacity_available' => max(0, $availableCapacity),
            'capacity_total' => $dailyLimit,
            'requested_files' => $fileCount,
            'message' => $hasCapacity
                ? "Available capacity: {$availableCapacity} files"
                : "Insufficient capacity. Only {$availableCapacity} files available, but {$fileCount} requested.",
            'reason' => $hasCapacity ? 'available' : 'capacity_full'
        ]);
    }

    /**
     * Store a newly created appointment with auto-split functionality
     */
    public function store(Request $request)
    {
        try {
            $validated = $this->validateAppointmentRequest($request);
            $appointments = $this->createSplitAppointments($validated);

            // Notify admins about the new appointment (dispatch event for parent appointment)
            if (!empty($appointments)) {
                $parentAppointment = $appointments[0]; // First appointment is the parent
                $user = Auth::user();
                $message = count($appointments) > 1
                    ? "New appointment request from {$user->name}: {$parentAppointment->school_name} (split into " . count($appointments) . " days)"
                    : "New appointment request from {$user->name}: {$parentAppointment->school_name}";

                AppointmentCreated::dispatch($parentAppointment, $message);
            }

            $message = $this->getSuccessMessage(count($appointments));

            return $this->handleResponse($request, $message, $appointments);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->handleValidationError($request, $e);
        } catch (\Exception $e) {
            return $this->handleException($request, $e);
        }
    }

    /**
     * Validate the appointment request
     */
    private function validateAppointmentRequest(Request $request): array
    {
        $fileCount = $request->input('file_count');
        $appointmentDate = $request->input('appointment_date');

        return $request->validate([
            'school_name' => 'required|string|max:255',
            'appointment_date' => [
                'required',
                'date',
                new ValidAppointmentDate(),
            ],
            'reason' => 'nullable|string',
            'file_count' => [
                'required',
                'integer',
                'min:1',
                'max:' . Appointments::MAX_FILES_PER_APPOINTMENT,
                new AppointmentDailyCapacityRule($fileCount, $appointmentDate),
            ],
        ]);
    }

    /**
     * Create split appointments across multiple days
     */
    private function createSplitAppointments(array $validated): array
    {
        $fileCount = $validated['file_count'];
        $startDate = \Carbon\Carbon::parse($validated['appointment_date']);
        $dailyLimit = Appointments::DAILY_FILE_LIMIT;

        $appointments = [];
        $remainingFiles = $fileCount;
        $currentDate = $startDate->copy();
        $splitSequence = 1;
        $parentAppointment = null;

        while ($remainingFiles > 0) {
            $currentDate = $this->findNextAvailableDate($currentDate);
            $availableCapacity = $this->getAvailableCapacity($currentDate, $dailyLimit);

            if ($availableCapacity <= 0) {
                $currentDate->addDay();
                continue;
            }

            $filesForThisDay = $this->calculateFilesForDay($remainingFiles, $availableCapacity, $dailyLimit);
            $appointment = $this->createAppointmentRecord($validated, $currentDate, $fileCount, $filesForThisDay, $splitSequence, $dailyLimit);

            if ($parentAppointment === null) {
                $parentAppointment = $appointment;
            } else {
                $appointment->update(['parent_appointment_id' => $parentAppointment->id]);
            }

            $appointments[] = $appointment;
            $remainingFiles -= $filesForThisDay;
            $splitSequence++;
            $currentDate->addDay();
        }

        $this->updateTotalSplits($appointments);
        return $appointments;
    }

    /**
     * Find the next available date (skip weekends and events)
     */
    private function findNextAvailableDate(\Carbon\Carbon $date): \Carbon\Carbon
    {
        while ($date->isWeekend()) {
            $date->addDay();
        }

        while (CalendarEvents::whereDate('event_date', $date)->exists()) {
            $date->addDay();
            while ($date->isWeekend()) {
                $date->addDay();
            }
        }

        return $date;
    }

    /**
     * Get available capacity for a specific date
     */
    private function getAvailableCapacity(\Carbon\Carbon $date, int $dailyLimit): int
    {
        $existingFilesCount = Appointments::whereDate('appointment_date', $date)
            ->sum('daily_file_count') ?: 0;

        return max(0, $dailyLimit - $existingFilesCount);
    }

    /**
     * Calculate files for a specific day (capped at daily limit)
     */
    private function calculateFilesForDay(int $remainingFiles, int $availableCapacity, int $dailyLimit): int
    {
        return min($remainingFiles, $availableCapacity, $dailyLimit);
    }

    /**
     * Create a single appointment record
     */
    private function createAppointmentRecord(
        array $validated,
        \Carbon\Carbon $date,
        int $fileCount,
        int $filesForThisDay,
        int $splitSequence,
        int $dailyLimit
    ): Appointments {
        return Appointments::create([
            'school_name' => $validated['school_name'],
            'appointment_date' => $date->format('Y-m-d'),
            'reason' => $validated['reason'] ?? null,
            'file_count' => $fileCount,
            'daily_file_count' => $filesForThisDay,
            'assigned_by' => Auth::id(),
            'status' => 'pending',
            'is_split' => $fileCount > $dailyLimit,
            'split_sequence' => $fileCount > $dailyLimit ? $splitSequence : null,
            'parent_appointment_id' => null,
        ]);
    }

    /**
     * Update all appointments with total splits count
     */
    private function updateTotalSplits(array $appointments): void
    {
        $totalSplits = count($appointments);
        if ($totalSplits > 1) {
            foreach ($appointments as $appointment) {
                $appointment->update(['total_splits' => $totalSplits]);
            }
        }
    }

    /**
     * Get success message based on number of appointments created
     */
    private function getSuccessMessage(int $totalSplits): string
    {
        return $totalSplits > 1
            ? "Appointment created and split into {$totalSplits} days due to daily capacity limits."
            : 'Appointment created successfully';
    }

    /**
     * Handle response (JSON or redirect)
     */
    private function handleResponse(Request $request, string $message, array $appointments)
    {
        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
                'appointments' => $this->formatAppointmentsForJson($appointments),
            ]);
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Format appointments for JSON response
     */
    private function formatAppointmentsForJson(array $appointments): array
    {
        return collect($appointments)->map(function ($appointment) {
            return [
                'id' => $appointment->id,
                'school_name' => $appointment->school_name,
                'date' => $appointment->appointment_date instanceof \Carbon\Carbon
                    ? $appointment->appointment_date->format('Y-m-d')
                    : \Carbon\Carbon::parse($appointment->appointment_date)->format('Y-m-d'),
                'file_count' => $appointment->file_count,
            ];
        })->toArray();
    }

    /**
     * Handle validation errors
     */
    private function handleValidationError(Request $request, \Illuminate\Validation\ValidationException $e)
    {
        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        }
        return redirect()->back()->withErrors($e->errors())->withInput();
    }

    /**
     * Handle exceptions
     */
    private function handleException(Request $request, \Exception $e)
    {
        \Illuminate\Support\Facades\Log::error('Error creating appointment: ' . $e->getMessage());

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create appointment: ' . $e->getMessage()
            ], 500);
        }

        return redirect()->back()->withErrors(['error' => 'Failed to create appointment: ' . $e->getMessage()]);
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

        // User can only delete their own appointment
        if ($appointment->assigned_by !== Auth::id()) {
            abort(403, 'You can only delete your own appointments.');
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
