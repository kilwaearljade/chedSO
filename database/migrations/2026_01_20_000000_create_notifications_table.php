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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // 'appointment_confirmed', 'new_message', 'event_created', 'new_registration', 'activity_update'
            $table->string('title');
            $table->text('message');
            $table->morphs('notifiable'); // polymorphic relation for linking to different models
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->json('data')->nullable(); // store additional data as JSON
            $table->timestamps();

            $table->index('user_id');
            $table->index('is_read');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
