<?php

namespace Tests\Feature;

use App\Models\Appointments;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Carbon\Carbon;

class SchoolCalendarDailyLimitTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a test user for all tests
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    /**
     * Test that appointment creation is blocked when daily limit is reached (200 files)
     */
    public function test_cannot_create_appointment_when_daily_limit_reached()
    {
        // Create an appointment with 200 files on a specific date
        $testDate = Carbon::parse('2026-02-01');

        $appointment = Appointments::create([
            'school_name' => 'Test School A',
            'appointment_date' => $testDate->format('Y-m-d'),
            'file_count' => 200,
            'daily_file_count' => 200,
            'reason' => 'Full capacity test',
            'assigned_by' => $this->user->id,
            'status' => 'pending',
        ]);

        // Verify the appointment was created
        $this->assertDatabaseHas('appointments', [
            'school_name' => 'Test School A',
            'daily_file_count' => 200,
        ]);

        // Now try to create another appointment for the same date
        $response = $this->postJson('/school/calendar/appointments', [
            'school_name' => 'Test School B',
            'appointment_date' => $testDate->format('Y-m-d'),
            'file_count' => 1,  // Even 1 file should fail when day is full
            'reason' => 'Should fail - day is full',
        ]);

        // Should be rejected (422 validation error)
        $response->assertStatus(422);

        // Verify error message indicates insufficient capacity
        $response->assertJsonValidationErrors('file_count');
    }

    /**
     * Test that appointment with exact remaining capacity is allowed
     */
    public function test_can_create_appointment_with_remaining_capacity()
    {
        $testDate = Carbon::parse('2026-02-02');

        // Create an appointment with 150 files
        Appointments::create([
            'school_name' => 'Test School A',
            'appointment_date' => $testDate->format('Y-m-d'),
            'file_count' => 150,
            'daily_file_count' => 150,
            'reason' => 'Partial capacity test',
            'assigned_by' => $this->user->id,
            'status' => 'pending',
        ]);

        // Try to create another appointment with 50 files (exact remaining capacity)
        $response = $this->postJson('/school/calendar/appointments', [
            'school_name' => 'Test School B',
            'appointment_date' => $testDate->format('Y-m-d'),
            'file_count' => 50,
            'reason' => 'Should succeed - fits in remaining 50 slots',
        ]);

        // Should succeed
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    /**
     * Test that appointment exceeding remaining capacity is split to next day
     */
    public function test_appointment_exceeding_capacity_splits_to_next_day()
    {
        $testDate = Carbon::parse('2026-02-03');

        // Create an appointment with 180 files on day 1
        Appointments::create([
            'school_name' => 'Test School A',
            'appointment_date' => $testDate->format('Y-m-d'),
            'file_count' => 180,
            'daily_file_count' => 180,
            'reason' => 'Partial capacity on day 1',
            'assigned_by' => $this->user->id,
            'status' => 'pending',
        ]);

        // Try to create an appointment with 50 files (20 will fit on day 1, 30 on day 2)
        $response = $this->postJson('/school/calendar/appointments', [
            'school_name' => 'Test School B',
            'appointment_date' => $testDate->format('Y-m-d'),
            'file_count' => 50,
            'reason' => 'Should split across 2 days',
        ]);

        // Should succeed with split
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        // Verify split information is in response
        $response->assertJsonFragment(['is_split' => true]);
    }

    /**
     * Test that appointment completely blocked when no capacity for 365 days
     */
    public function test_cannot_create_appointment_when_no_capacity_for_year()
    {
        $startDate = Carbon::parse('2026-02-04');

        // Fill up 150 weekdays (approximately 6 months) with max capacity
        for ($i = 0; $i < 150; $i++) {
            $currentDate = $startDate->copy()->addDays($i);

            // Skip weekends
            while ($currentDate->isWeekend()) {
                $currentDate->addDay();
            }

            Appointments::create([
                'school_name' => 'School ' . ($i % 5),
                'appointment_date' => $currentDate->format('Y-m-d'),
                'file_count' => 200,
                'daily_file_count' => 200,
                'reason' => 'Capacity fill test day ' . $i,
                'assigned_by' => $this->user->id,
                'status' => 'pending',
            ]);
        }

        // Now try to create a large appointment that can't fit anywhere
        $response = $this->postJson('/school/calendar/appointments', [
            'school_name' => 'Test School Unable',
            'appointment_date' => $startDate->format('Y-m-d'),
            'file_count' => 1000,  // Will need ~150 days worth of capacity
            'reason' => 'Should fail - insufficient calendar space',
        ]);

        // Should be rejected
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('file_count');
    }

    /**
     * Test daily limit constant is correctly set to 200
     */
    public function test_daily_file_limit_constant_is_200()
    {
        $this->assertEquals(200, Appointments::DAILY_FILE_LIMIT);
        $this->assertEquals(200, Appointments::MAX_FILES_PER_APPOINTMENT);
    }
}
