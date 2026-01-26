<?php

namespace App\Http\Controllers;

use App\Events\AppointmentConfirmed;
use App\Events\AppointmentCreated;
use App\Models\Appointments as AppointmentsModel;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class Appointments extends Controller
{
    /**
     * Display a listing of appointments with filtering and pagination
     */
    public function index(Request $request)
    {
        $query = AppointmentsModel::with('user');

        // Search by school name
        if ($request->filled('search')) {
            $query->where('school_name', 'like', '%' . $request->get('search') . '%');
        }

        // Filter by status
        if ($request->filled('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        // Filter by date
        if ($request->filled('date')) {
            $query->whereDate('appointment_date', $request->get('date'));
        }

        // Get paginated results
        $appointments = $query->paginate(9);

        return Inertia::render('admin/appointment', [
            'appointments' => $appointments,
            'filters' => [
                'search' => $request->get('search') ?? '',
                'status' => $request->get('status') ?? 'all',
                'date' => $request->get('date') ?? '',
            ],
        ]);
    }

    /**
     * Update the status of an appointment
     */
    public function updateStatus(Request $request, AppointmentsModel $appointment)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,complete,cancelled',
        ]);

        $oldStatus = $appointment->status;
        $newStatus = $validated['status'];

        $appointment->update([
            'status' => $newStatus,
        ]);

        // Send notification to school user if status changed to complete or cancelled
        if ($oldStatus !== $newStatus && ($newStatus === 'complete' || $newStatus === 'cancelled')) {
            $schoolUser = User::find($appointment->assigned_by);
            
            if ($schoolUser) {
                $title = $newStatus === 'complete' 
                    ? 'Appointment Completed' 
                    : 'Appointment Cancelled';
                
                $message = $newStatus === 'complete'
                    ? "Your appointment for {$appointment->school_name} has been marked as complete."
                    : "Your appointment for {$appointment->school_name} has been cancelled.";

                Notification::create([
                    'user_id' => $schoolUser->id,
                    'type' => $newStatus === 'complete' ? 'appointment_completed' : 'appointment_cancelled',
                    'title' => $title,
                    'message' => $message,
                    'notifiable_type' => 'App\\Models\\Appointments',
                    'notifiable_id' => $appointment->id,
                    'is_read' => false,
                    'data' => [
                        'appointment_id' => $appointment->id,
                        'school_name' => $appointment->school_name,
                        'appointment_date' => (string) $appointment->appointment_date,
                        'status' => $newStatus,
                        'file_count' => $appointment->file_count,
                    ],
                ]);
            }
        }

        // Preserve query parameters from referrer if available
        $referrer = $request->header('referer');
        $queryParams = [];
        
        if ($referrer && parse_url($referrer, PHP_URL_QUERY)) {
            parse_str(parse_url($referrer, PHP_URL_QUERY), $queryParams);
        }

        return redirect()->route('appointment.index', $queryParams)->with('success', 'Appointment status updated successfully');
    }

    /**
     * Store a newly created appointment
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_name' => 'required|string|max:255',
            'appointment_date' => 'required|date',
            'reason' => 'required|string|max:1000',
            'status' => 'required|in:pending,complete,cancelled',
        ]);

        $validated['assigned_by'] = Auth::id();
        $validated['file_count'] = 0;

        $appointment = AppointmentsModel::create($validated);

        // Fire the appointment created event to notify admins
        AppointmentCreated::dispatch($appointment, "New appointment request from " . Auth::user()->name);

        return redirect()->back()->with('success', 'Appointment created successfully');
    }

    /**
     * Update an appointment
     */
    public function update(Request $request, AppointmentsModel $appointment)
    {
        $validated = $request->validate([
            'school_name' => 'required|string|max:255',
            'appointment_date' => 'required|date',
            'reason' => 'required|string|max:1000',
            'status' => 'required|in:pending,complete,cancelled',
        ]);

        $appointment->update($validated);

        return redirect()->back()->with('success', 'Appointment updated successfully');
    }

    /**
     * Delete an appointment
     */
    public function destroy(AppointmentsModel $appointment)
    {
        $appointment->delete();

        return redirect()->back()->with('success', 'Appointment deleted successfully');
    }

    /**
     * Approve an appointment
     */
    public function approve(AppointmentsModel $appointment)
    {
        $appointment->update([
            'status' => 'complete',
        ]);

        // Fire the appointment confirmed event
        AppointmentConfirmed::dispatch($appointment, 'Your appointment has been approved');

        return redirect()->back()->with('success', 'Appointment approved successfully');
    }

    /**
     * Decline an appointment
     */
    public function decline(AppointmentsModel $appointment)
    {
        $appointment->update([
            'status' => 'cancelled',
        ]);

        // Send notification to school user
        $schoolUser = User::find($appointment->assigned_by);
        
        if ($schoolUser) {
            Notification::create([
                'user_id' => $schoolUser->id,
                'type' => 'appointment_cancelled',
                'title' => 'Appointment Declined',
                'message' => "Your appointment for {$appointment->school_name} has been declined.",
                'notifiable_type' => 'App\\Models\\Appointments',
                'notifiable_id' => $appointment->id,
                'is_read' => false,
                'data' => [
                    'appointment_id' => $appointment->id,
                    'school_name' => $appointment->school_name,
                    'appointment_date' => (string) $appointment->appointment_date,
                    'status' => 'cancelled',
                    'file_count' => $appointment->file_count,
                ],
            ]);
        }

        return redirect()->back()->with('success', 'Appointment declined successfully');
    }
}
