<?php

namespace App\Http\Controllers;

use App\Models\FeedBack;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class SchoolFeedBack extends Controller
{
    /**
     * Store a newly created feedback.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'min:10', 'max:1000'],
        ]);

        FeedBack::create([
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'status' => 'New',
        ]);

        return redirect()->route('schoolfeedback')
            ->with('status', 'Thank you! Your feedback has been submitted successfully.');
    }
}
