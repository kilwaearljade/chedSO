<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'ched@gov.ph'],
            [
                'name' => 'CHED Admin',
                'password' => 'password',
                'email_verified_at' => now(),
                'role' => 'admin',
                'is_approve' => true,
            ]
        );
        User::firstOrCreate(
            ['email' => 'school@gov.ph'],
            [
                'name' => 'school',
                'password' => 'password',
                'email_verified_at' => now(),
                'role' => 'school',
                'is_approve' => false,
            ]
        );
    }
}
