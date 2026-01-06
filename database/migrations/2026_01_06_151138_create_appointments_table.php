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
            $table->unsignedInteger('file_count');
            $table->string('reason')->nullable();
            $table->unsignedBigInteger('assigned_by')->nullable()->index();
            $table->enum('status', ['pending','cancelled','complete'])->default('pending');
            $table->softDeletes(); // creates deleted_at
            $table->timestamps();
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
