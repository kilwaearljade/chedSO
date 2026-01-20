<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
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
     * Get automatic admin response based on predefined message.
     */
    private function getAdminResponse(string $message): string
    {
        $responses = [
            "Good morning, I need assistance with my application." => "Good morning! I'd be happy to help you with your application. Please provide your application reference number, and I'll look into it right away.",
            "Hello, I have a question about the submission requirements." => "Hello! For submission requirements, please ensure you have completed all required documents including your school registration form, accreditation certificates, and any other relevant documentation. You can find the complete checklist in your dashboard.",
            "Hi, can you help me with the approval process?" => "Hi! I can help you understand the approval process. Typically, applications are reviewed within 5-7 business days. You'll receive a notification once your application has been reviewed. Is there a specific aspect of the approval process you'd like to know more about?",
            "Good afternoon, I need to update my school information." => "Good afternoon! To update your school information, please go to your profile settings and make the necessary changes. If you need to update critical information like your school name or address, please contact us directly for assistance.",
            "Hello, I'm having trouble accessing my account." => "Hello! I'm sorry to hear you're having trouble accessing your account. Please try resetting your password using the 'Forgot Password' link on the login page. If the issue persists, please provide more details about the error you're encountering.",
            "Hi, when will my application be reviewed?" => "Hi! Application reviews are typically completed within 5-7 business days from the date of submission. You can check the status of your application in your dashboard. If it's been longer than 7 days, please let me know and I'll investigate.",
            "Good day, I need to submit additional documents." => "Good day! You can submit additional documents by going to your application page and using the 'Upload Documents' feature. Please ensure all documents are in PDF format and clearly labeled. If you encounter any issues, let me know.",
            "Hello, can you clarify the registration process?" => "Hello! The registration process involves: 1) Creating an account, 2) Completing your school profile, 3) Submitting required documents, 4) Waiting for approval. Once approved, you'll have full access to the system. Would you like more details on any specific step?",
            "Hi, I need help with the calendar scheduling." => "Hi! For calendar scheduling, you can view available appointment slots in the calendar section. Simply select a date and time that works for you. If you need to reschedule or cancel, you can do so from your appointments page.",
            "Good morning, I have a concern about my profile." => "Good morning! I'm here to help with your profile concern. Please describe the specific issue you're experiencing, and I'll assist you in resolving it. You can also update most profile information directly from your settings page.",
            "Hello, I need to reset my password." => "Hello! To reset your password, please click on 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link via email. If you don't receive the email, please check your spam folder or contact support.",
            "Hi, can you provide information about upcoming events?" => "Hi! You can find information about upcoming events in the calendar section of your dashboard. All scheduled events, meetings, and important dates are displayed there. Is there a specific event you're looking for?",
            "Good afternoon, I need assistance with document verification." => "Good afternoon! Document verification typically takes 3-5 business days. You'll receive a notification once your documents have been verified. If you need to check the status, please visit your documents section in the dashboard.",
            "Hello, I have questions about the feedback system." => "Hello! The feedback system allows you to submit comments, suggestions, or report issues. You can access it from the feedback section in your dashboard. Your feedback helps us improve our services. Is there something specific you'd like to know?",
            "Hi, I need help understanding the requirements." => "Hi! I'd be happy to help you understand the requirements. The main requirements include: valid school registration, accreditation documents, and complete profile information. You can find a detailed checklist in your application dashboard. Which requirement would you like more information about?",
        ];

        // Return matching response or default
        return $responses[$message] ?? "Thank you for your message. We have received your inquiry and will get back to you shortly. If this is urgent, please contact our support team directly.";
    }

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

        // Fire message sent event for real-time notifications
        MessageSent::dispatch($message);

        $response = [
            'success' => true,
            'message' => [
                'id' => $message->id,
                'sender' => 'me',
                'text' => $message->message,
                'timestamp' => $message->created_at->format('g:i A'),
            ],
        ];

        // Auto-respond if message is from school user to admin
        if ($user->role === 'school' && $receiver->role === 'admin') {
            // Get admin response
            $adminResponse = $this->getAdminResponse($validated['message']);

            // Create auto-response from admin
            $autoResponse = Message::create([
                'sender_id' => $receiver->id,
                'receiver_id' => $user->id,
                'sender_role' => 'ched_admin',
                'receiver_role' => 'school_registrar',
                'message' => $adminResponse,
            ]);

            // Fire event for auto-response as well
            MessageSent::dispatch($autoResponse);

            // Add auto-response to the response
            $response['autoResponse'] = [
                'id' => $autoResponse->id,
                'sender' => 'other',
                'text' => $autoResponse->message,
                'timestamp' => $autoResponse->created_at->format('g:i A'),
            ];
        }

        return response()->json($response);
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
