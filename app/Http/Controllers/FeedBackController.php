<?php

namespace App\Http\Controllers;

use App\Models\FeedBack as FeedBackModel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedBackController extends Controller
{
    /**
     * Display a listing of all feedbacks.
     */
    public function index(): Response
    {
        $feedbacks = FeedBackModel::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($feedback) {
                return [
                    'id' => $feedback->id,
                    'rating' => $feedback->rating,
                    'comment' => $feedback->comment,
                    'status' => $feedback->status,
                    'created_at' => $feedback->created_at?->format('Y-m-d H:i:s'),
                    'created_date' => $feedback->created_at?->format('M d, Y'),
                    'created_time' => $feedback->created_at?->format('h:i A'),
                ];
            });

        // Group feedbacks by rating
        $feedbacksByRating = [];
        for ($rating = 5; $rating >= 1; $rating--) {
            $feedbacksByRating[$rating] = $feedbacks->filter(function ($feedback) use ($rating) {
                return $feedback['rating'] === $rating;
            })->values()->all();
        }

        return Inertia::render('admin/feedback', [
            'feedbacks' => $feedbacksByRating,
            'totalFeedbacks' => $feedbacks->count(),
        ]);
    }
}
