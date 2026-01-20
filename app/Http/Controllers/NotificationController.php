<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 20);

        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($notifications);
    }

    /**
     * Get unread notifications only
     */
    public function unread(Request $request)
    {
        $user = Auth::user();
        $limit = $request->get('limit', 10);

        $notifications = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($notifications);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount()
    {
        $user = Auth::user();
        $count = Notification::getUnreadCount($user->id);

        return response()->json(['unread_count' => $count]);
    }

    /**
     * Mark a single notification as read
     */
    public function markAsRead(Notification $notification)
    {
        $user = Auth::user();

        if ($notification->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read', 'notification' => $notification]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        $user = Auth::user();

        Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Delete a notification
     */
    public function destroy(Notification $notification)
    {
        $user = Auth::user();

        if ($notification->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }

    /**
     * Clear all notifications
     */
    public function clearAll()
    {
        $user = Auth::user();

        Notification::where('user_id', $user->id)->delete();

        return response()->json(['message' => 'All notifications cleared']);
    }

    /**
     * Get notifications by type
     */
    public function getByType(Request $request)
    {
        $user = Auth::user();
        $type = $request->get('type');
        $perPage = $request->get('per_page', 20);

        if (!$type) {
            return response()->json(['error' => 'Type parameter is required'], 400);
        }

        $notifications = Notification::where('user_id', $user->id)
            ->where('type', $type)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($notifications);
    }

    /**
     * Get admin activity notifications (all activities in the system)
     */
    public function adminActivity()
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $notifications = Notification::where('user_id', $user->id)
            ->where('type', 'like', '%activity%')
            ->orWhere('type', 'new_registration')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }
}
