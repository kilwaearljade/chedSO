<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Message;
use App\Models\Appointments;
use App\Models\CalendarEvents;
use App\Models\FeedBack;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display admin dashboard with statistics.
     */
    public function admin(): Response
    {
        $user = Auth::user();

        // Calculate statistics for cards
        $totalAppointments = Appointments::count();
        $totalFileCount = Appointments::sum('file_count');
        $completedAppointments = Appointments::where('status', 'complete')->count();
        $completedFileCount = Appointments::where('status', 'complete')->sum('file_count');
        $approvedSchools = User::where('role', 'school')->where('is_approve', true)->count();
        $totalSchools = User::where('role', 'school')->count();
        
        // Calculate growth rates (comparing last 30 days to previous 30 days)
        $last30DaysStart = Carbon::now()->subDays(30);
        $last30DaysEnd = Carbon::now();
        $previous30DaysStart = Carbon::now()->subDays(60);
        $previous30DaysEnd = Carbon::now()->subDays(30);

        $recentAppointments = Appointments::whereBetween('created_at', [$last30DaysStart, $last30DaysEnd])->count();
        $previousAppointments = Appointments::whereBetween('created_at', [$previous30DaysStart, $previous30DaysEnd])->count();
        $appointmentGrowthRate = $previousAppointments > 0 
            ? round((($recentAppointments - $previousAppointments) / $previousAppointments) * 100, 1)
            : 0;

        $recentCompleted = Appointments::where('status', 'complete')
            ->whereBetween('updated_at', [$last30DaysStart, $last30DaysEnd])
            ->count();
        $previousCompleted = Appointments::where('status', 'complete')
            ->whereBetween('updated_at', [$previous30DaysStart, $previous30DaysEnd])
            ->count();
        $completionGrowthRate = $previousCompleted > 0
            ? round((($recentCompleted - $previousCompleted) / $previousCompleted) * 100, 1)
            : 0;

        $recentSchools = User::where('role', 'school')
            ->whereBetween('created_at', [$last30DaysStart, $last30DaysEnd])
            ->count();
        $previousSchools = User::where('role', 'school')
            ->whereBetween('created_at', [$previous30DaysStart, $previous30DaysEnd])
            ->count();
        $schoolGrowthRate = $previousSchools > 0
            ? round((($recentSchools - $previousSchools) / $previousSchools) * 100, 1)
            : ($recentSchools > 0 ? 100 : 0);

        // Calculate overall growth rate (average of all metrics)
        $overallGrowthRate = round(($appointmentGrowthRate + $completionGrowthRate + $schoolGrowthRate) / 3, 1);

        // Cards data
        $cardsData = [
            [
                'title' => number_format($totalFileCount),
                'description' => 'Total File Appointments',
                'trend' => $appointmentGrowthRate >= 0 ? '+' . $appointmentGrowthRate . '%' : $appointmentGrowthRate . '%',
                'trendUp' => $appointmentGrowthRate >= 0,
                'footer' => 'File Count Appointments ' . ($appointmentGrowthRate >= 0 ? 'Increase' : 'Decrease'),
                'footerSubtext' => 'Pending Appointments: ' . Appointments::where('status', 'pending')->count(),
            ],
            [
                'title' => number_format($completedFileCount),
                'description' => 'File Complete',
                'trend' => $completionGrowthRate >= 0 ? '+' . $completionGrowthRate . '%' : $completionGrowthRate . '%',
                'trendUp' => $completionGrowthRate >= 0,
                'footer' => 'Up ' . abs($completionGrowthRate) . '% Complete',
                'footerSubtext' => 'File Successful Complete',
            ],
            [
                'title' => number_format($approvedSchools),
                'description' => 'Active Schools Accounts',
                'trend' => $schoolGrowthRate >= 0 ? '+' . $schoolGrowthRate . '%' : $schoolGrowthRate . '%',
                'trendUp' => $schoolGrowthRate >= 0,
                'footer' => $schoolGrowthRate >= 0 ? 'All School is Active' : 'School Activity',
                'footerSubtext' => 'Still Monitor',
            ],
            [
                'title' => $overallGrowthRate . '%',
                'description' => 'Growth Rate',
                'trend' => $overallGrowthRate >= 0 ? '+' . $overallGrowthRate . '%' : $overallGrowthRate . '%',
                'trendUp' => $overallGrowthRate >= 0,
                'footer' => 'Steady performance ' . ($overallGrowthRate >= 0 ? 'increase' : 'decrease'),
                'footerSubtext' => 'Meets growth projections',
            ],
        ];

        // Chart data - last 365 days (for yearly view)
        $chartData = [];
        for ($i = 364; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $chartData[] = [
                'date' => $date->format('Y-m-d'),
                'messages' => Message::whereDate('created_at', $date)->count(),
                'appointments' => Appointments::whereDate('created_at', $date)->count(),
            ];
        }

        return Inertia::render('admin/dashboard', [
            'cardsData' => $cardsData,
            'chartData' => $chartData,
        ]);
    }
}
