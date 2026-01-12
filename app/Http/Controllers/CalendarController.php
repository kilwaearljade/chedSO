<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvents;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CalendarController extends Controller
{
    /**
     * Display the calendar page with events
     */
public function index()
{
    $events = CalendarEvents::where('created_by', Auth::id())
        ->orderBy('event_date', 'asc')
        ->get()
        ->map(function ($event) {
            $eventDate = \Carbon\Carbon::parse($event->event_date);

            return [
                'id' => $event->id,
                'name' => $event->event_name,
                'date' => $eventDate->format('Y-m-d'),
                'day' => $eventDate->format('j'),
                'description' => $event->description,
                'color' => $this->getEventColor($event->id),
            ];
        });

    return Inertia::render('admin/calendar', [
        'events' => $events,
    ]);
}

    /**
     * Get events for a specific date
     */
    public function getEventsByDate(Request $request)
    {
        $date = $request->input('date');

        $events = CalendarEvents::where('created_by', Auth::id())
            ->whereDate('event_date', $date)
            ->get()
            ->map(function ($event) {
                $parsed = \Carbon\Carbon::parse($event->event_date);
                return [
                    'id' => $event->id,
                    'name' => $event->event_name,
                    'date' => $parsed->format('Y-m-d'),
                    'description' => $event->description,
                    'color' => $this->getEventColor($event->id),
                ];
            });

        return response()->json($events);
    }

    /**
     * Store a newly created event
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $event = CalendarEvents::create([
            'event_name' => $validated['event_name'],
            'event_date' => $validated['event_date'],
            'description' => $validated['description'] ?? null,
            'created_by' => Auth::id(),
        ]);

        $parsedEventDate = \Carbon\Carbon::parse($event->event_date);
        return response()->json([
            'success' => true,
            'event' => [
                'id' => $event->id,
                'name' => $event->event_name,
                'date' => $parsedEventDate->format('Y-m-d'),
                'day' => $parsedEventDate->format('j'),
                'description' => $event->description,
                'color' => $this->getEventColor($event->id),
            ],
        ]);
    }

    /**
     * Update the specified event
     */
    public function update(Request $request, CalendarEvents $event)
    {
        // Check if user owns this event
        if ($event->created_by !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'event_name' => 'required|string|max:255',
            'event_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $event->update($validated);

        $parsedEventDate = \Carbon\Carbon::parse($event->event_date);
        return response()->json([
            'success' => true,
            'event' => [
                'id' => $event->id,
                'name' => $event->event_name,
                'date' => $parsedEventDate->format('Y-m-d'),
                'day' => $parsedEventDate->format('j'),
                'description' => $event->description,
                'color' => $this->getEventColor($event->id),
            ],
        ]);
    }

    /**
     * Remove the specified event
     */
    public function destroy(CalendarEvents $event)
    {
        // Check if user owns this event
        if ($event->created_by !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $event->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Get a color for the event based on ID
     */
    private function getEventColor($id)
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
}
