<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * messages — task thread messages only.
     * Replaces the old polymorphic single-table design entirely.
     *
     * Removed: user_id, messageable_type, messageable_id, parent_id, edited_at.
     * sender_id references employees, not users.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thread_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('employees')->cascadeOnDelete();
            $table->text('message_body');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
