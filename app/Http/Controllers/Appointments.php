<?php

namespace App\Http\Controllers;

use App\Models\Appointments as AppointmentsModel;
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

        $appointment->update([
            'status' => $validated['status'],
        ]);

        return redirect()->back()->with('success', 'Appointment status updated successfully');
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

        AppointmentsModel::create($validated);

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

        return redirect()->back()->with('success', 'Appointment declined successfully');
    }
}
