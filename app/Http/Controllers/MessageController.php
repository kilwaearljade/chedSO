<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Display messages page with conversations list.
     */
    public function index(): Response
    {
        $user = Auth::user();

        // Get all messages involving this user
        $allMessages = Message::where('sender_id', $user->id)
            ->orWhere('receiver_id', $user->id)
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Group by the other user ID and get the most recent message for each conversation
        $conversationsMap = [];
        foreach ($allMessages as $message) {
            $otherUserId = $message->sender_id === $user->id ? $message->receiver_id : $message->sender_id;
            
            if (!isset($conversationsMap[$otherUserId])) {
                $conversationsMap[$otherUserId] = [
                    'other_user_id' => $otherUserId,
                    'last_message' => $message,
                    'unread_count' => 0,
                ];
            }
        }

        // Count unread messages for each conversation
        foreach ($conversationsMap as $otherUserId => &$conversation) {
            $conversation['unread_count'] = Message::where('sender_id', $otherUserId)
                ->where('receiver_id', $user->id)
                ->whereNull('read_at')
                ->count();
        }

        // Sort conversations by last message time (most recent first)
        uasort($conversationsMap, function ($a, $b) {
            $timeA = $a['last_message'] ? $a['last_message']->created_at->timestamp : 0;
            $timeB = $b['last_message'] ? $b['last_message']->created_at->timestamp : 0;
            return $timeB <=> $timeA;
        });

        // Convert to array and get user details
        $conversations = collect($conversationsMap)->map(function ($conv) use ($user) {
            $otherUser = User::find($conv['other_user_id']);
            if (!$otherUser) {
                return null;
            }

            return [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'avatar' => $otherUser->avatar ?? null,
                'lastMessage' => $conv['last_message'] ? substr($conv['last_message']->message, 0, 50) : '',
                'timestamp' => $conv['last_message'] ? $conv['last_message']->created_at->format('g:i A') : '',
                'unread' => $conv['unread_count'],
                'isActive' => false, // You can implement online status later
            ];
        })->filter()->values();

        // Get all users that this user can message but haven't messaged yet
        $availableUsers = User::where('id', '!=', $user->id)
            ->where(function ($query) use ($user) {
                if ($user->role === 'admin') {
                    // Admin can message schools
                    $query->where('role', 'school');
                } else {
                    // School can message admin
                    $query->where('role', 'admin');
                }
            })
            ->select('id', 'name', 'email', 'avatar', 'role')
            ->get()
            ->map(function ($availableUser) use ($conversations) {
                // Check if conversation already exists
                $existingConv = $conversations->firstWhere('id', $availableUser->id);
                if ($existingConv) {
                    return null; // Skip, already in conversations
                }
                return [
                    'id' => $availableUser->id,
                    'name' => $availableUser->name,
                    'avatar' => $availableUser->avatar ?? null,
                    'lastMessage' => '',
                    'timestamp' => '',
                    'unread' => 0,
                    'isActive' => false,
                ];
            })
            ->filter()
            ->values();

        // Merge conversations and available users (conversations with messages first)
        $allConversations = $conversations->concat($availableUsers)->values();

        return Inertia::render(
            $user->role === 'admin' ? 'admin/message' : 'school/message',
            [
                'conversations' => $allConversations,
            ]
        );
    }

    /**
     * Get messages for a specific conversation.
     */
    public function getMessages(Request $request, $userId)
    {
        $user = Auth::user();
        $otherUser = User::findOrFail($userId);

        $messages = Message::where(function ($query) use ($user, $otherUser) {
            $query->where('sender_id', $user->id)
                  ->where('receiver_id', $otherUser->id);
        })->orWhere(function ($query) use ($user, $otherUser) {
            $query->where('sender_id', $otherUser->id)
                  ->where('receiver_id', $user->id);
        })
        ->orderBy('created_at', 'asc')
        ->get()
        ->map(function ($message) use ($user) {
            return [
                'id' => $message->id,
                'sender' => $message->sender_id === $user->id ? 'me' : 'other',
                'text' => $message->message,
                'timestamp' => $message->created_at->format('g:i A'),
            ];
        });

        // Mark messages as read
        Message::where('sender_id', $otherUser->id)
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['messages' => $messages]);
    }

    /**
     * Send a message.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'receiver_id' => ['required', 'exists:users,id'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $receiver = User::findOrFail($validated['receiver_id']);

        // Determine roles
        $senderRole = $user->role === 'admin' ? 'ched_admin' : 'school_registrar';
        $receiverRole = $receiver->role === 'admin' ? 'ched_admin' : 'school_registrar';

        $message = Message::create([
            'sender_id' => $user->id,
            'receiver_id' => $receiver->id,
            'sender_role' => $senderRole,
            'receiver_role' => $receiverRole,
            'message' => $validated['message'],
        ]);

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $message->id,
                'sender' => 'me',
                'text' => $message->message,
                'timestamp' => $message->created_at->format('g:i A'),
            ],
        ]);
    }

    /**
     * Mark messages as read.
     */
    public function markAsRead(Request $request, $userId)
    {
        $user = Auth::user();

        Message::where('sender_id', $userId)
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }
}
