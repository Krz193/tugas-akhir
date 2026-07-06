<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * message_project — project-level messages (ProjectMessage domain entity).
     * Completely separate from threads/messages — no polymorphism, no Thread.
     * sender_id references employees, not users.
     *
     * Table name is message_project per approved ERD naming.
     * The Eloquent model (ProjectMessage) must declare:
     *   protected $table = 'message_project';
     */
    public function up(): void
    {
        Schema::create('message_project', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
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
        Schema::dropIfExists('message_project');
    }
};
