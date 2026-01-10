<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class SchoolController extends Controller
{
    /**
     * Display a listing of users with role 'school'.
     */
    public function index()
    {
        $users = User::where('role', 'school')
            ->select('id', 'name', 'email', 'avatar', 'email_verified_at', 'is_approve', 'two_factor_enabled', 'created_at', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/school', [
            'users' => $users,
        ]);
    }

    /**
     * Approve a user.
     */
    public function approve(Request $request, User $user): RedirectResponse
    {
        // Ensure the user has role 'school'
        if ($user->role !== 'school') {
            return back()->withErrors(['error' => 'Only school users can be approved.']);
        }

        // Update the user's approval status
        $user->update([
            'is_approve' => true,
        ]);

        return back()->with('success', 'User approved successfully.');
    }

    /**
     * Decline/Disapprove a user.
     */
    public function decline(Request $request, User $user): RedirectResponse
    {
        // Ensure the user has role 'school'
        if ($user->role !== 'school') {
            return back()->withErrors(['error' => 'Only school users can be declined.']);
        }

        // Update the user's approval status
        $user->update([
            'is_approve' => false,
        ]);

        return back()->with('success', 'User declined successfully.');
    }
}
