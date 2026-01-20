<?php

namespace App\Rules;

use App\Models\CalendarEvents;
use Carbon\Carbon;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidAppointmentDate implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $date = Carbon::parse($value);
        $today = Carbon::today();

        // Check if date is today
        if ($date->isSameDay($today)) {
            $fail('Cannot create appointment for today. Please select a future date.');
            return;
        }

        // Check if date is in the past
        if ($date->lt($today)) {
            $fail('Cannot create appointment for a past date. Please select a future date.');
            return;
        }

        // Check if date is a weekend
        if ($date->isWeekend()) {
            $fail("Cannot create appointment on {$date->format('l, M d, Y')}. Weekends are not allowed.");
            return;
        }

        // Check if there's an event on this date
        $event = CalendarEvents::whereDate('event_date', $date)->first();
        if ($event) {
            $fail("Cannot create appointment on {$date->format('M d, Y')}. An event '{$event->event_name}' is scheduled on this date.");
            return;
        }
    }
}
