<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HistoryLogsController extends Controller
{
    /**
     * Show the account registration and approval history logs page.
     * Only accessible by admins.
     */
    public function index(Request $request): Response
    {
        // Get all users with role 'school' (registered accounts)
        $accounts = User::where('role', 'school')
            ->select('id', 'name', 'email', 'created_at', 'is_approve', 'updated_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'registered_at' => $user->created_at?->format('Y-m-d H:i:s'),
                    'registered_date' => $user->created_at?->format('M d, Y'),
                    'registered_time' => $user->created_at?->format('h:i A'),
                    'is_approved' => $user->is_approve ?? false,
                    'approved_at' => $user->is_approve && $user->updated_at ? $user->updated_at->format('Y-m-d H:i:s') : null,
                    'approved_date' => $user->is_approve && $user->updated_at ? $user->updated_at->format('M d, Y') : null,
                    'approved_time' => $user->is_approve && $user->updated_at ? $user->updated_at->format('h:i A') : null,
                    'status' => $user->is_approve ? 'approved' : 'pending',
                ];
            });

        $stats = [
            'total_registered' => $accounts->count(),
            'total_approved' => $accounts->where('is_approved', true)->count(),
            'total_pending' => $accounts->where('is_approved', false)->count(),
        ];

        return Inertia::render('settings/history-logs', [
            'accounts' => $accounts,
            'stats' => $stats,
        ]);
    }
}

