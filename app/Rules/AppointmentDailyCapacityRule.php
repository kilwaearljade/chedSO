<?php

namespace App\Rules;

use App\Models\Appointments;
use App\Models\CalendarEvents;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Carbon\Carbon;

class AppointmentDailyCapacityRule implements ValidationRule
{
    private $fileCount;
    private $appointmentDate;
    private $dailyLimit;
    private $errorMessage = '';

    public function __construct($fileCount, $appointmentDate)
    {
        $this->fileCount = $fileCount;
        $this->appointmentDate = $appointmentDate;
        $this->dailyLimit = Appointments::DAILY_FILE_LIMIT;
    }

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $startDate = Carbon::parse($this->appointmentDate);
        $remainingFiles = $this->fileCount;
        $currentDate = $startDate->copy();
        $maxDaysToCheck = 365; // Check up to 1 year ahead
        $daysChecked = 0;

        // Try to find available capacity for all files
        while ($remainingFiles > 0 && $daysChecked < $maxDaysToCheck) {
            // Skip weekends
            while ($currentDate->isWeekend()) {
                $currentDate->addDay();
                $daysChecked++;
            }

            // Check if there's an event on this date
            $hasEventOnDate = CalendarEvents::whereDate('event_date', $currentDate)->exists();
            if ($hasEventOnDate) {
                $currentDate->addDay();
                $daysChecked++;
                continue;
            }

            // Check current capacity for this date
            $existingFilesCount = Appointments::whereDate('appointment_date', $currentDate)
                ->sum('daily_file_count') ?: 0;

            $availableCapacity = $this->dailyLimit - $existingFilesCount;

            // If no capacity available, move to next day
            if ($availableCapacity <= 0) {
                $currentDate->addDay();
                $daysChecked++;
                continue;
            }

            // Calculate files for this day
            $filesForThisDay = min($remainingFiles, $availableCapacity);
            $remainingFiles -= $filesForThisDay;
            $currentDate->addDay();
            $daysChecked++;
        }

        // If there are still remaining files, capacity not available
        if ($remainingFiles > 0) {
            $this->errorMessage = "Cannot create appointment with {$this->fileCount} files. Insufficient capacity available in the calendar. Maximum 200 files per day, and we couldn't find {$remainingFiles} available slots within the next year.";
            $fail($this->errorMessage);
        }
    }

    public function message(): string
    {
        return $this->errorMessage ?: 'The appointment cannot be created due to insufficient capacity.';
    }
}
