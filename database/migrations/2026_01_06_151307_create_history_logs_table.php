<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('history_logs', function (Blueprint $table) {
            $table->id();

            // Optional: user reference
            $table->unsignedBigInteger('user_id')->nullable();

            // Time tracking
            $table->timestamp('time_in')->nullable();
            $table->timestamp('time_out')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('history_log');
    }
};
