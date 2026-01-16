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
        Schema::table('appointments', function (Blueprint $table) {
            // Add fields for split appointment tracking
            $table->unsignedBigInteger('parent_appointment_id')->nullable()->after('assigned_by');
            $table->boolean('is_split')->default(false)->after('parent_appointment_id');
            $table->integer('split_sequence')->nullable()->after('is_split'); // 1, 2, 3, etc.
            $table->integer('total_splits')->nullable()->after('split_sequence'); // total number of splits
            $table->integer('daily_file_count')->nullable()->after('total_splits'); // files for this specific day

            // Add index for better query performance
            $table->index('parent_appointment_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['parent_appointment_id']);
            $table->dropColumn([
                'parent_appointment_id',
                'is_split',
                'split_sequence',
                'total_splits',
                'daily_file_count'
            ]);
        });
    }
};
