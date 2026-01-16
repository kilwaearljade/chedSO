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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('school_name');
            $table->date('appointment_date')->index();
            $table->unsignedInteger('file_count')->default(0);
            $table->text('reason')->nullable();
            $table->unsignedBigInteger('assigned_by')->nullable()->index();
            $table->enum('status', ['pending', 'cancelled', 'complete'])->default('pending');
            $table->softDeletes();
            $table->timestamps();

            // Add foreign key constraint with cascade on delete
            $table->foreign('assigned_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
