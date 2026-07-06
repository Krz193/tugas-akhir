<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * project_members — links employees (not users) to projects.
     * The Project Manager is NOT inserted here automatically.
     * PM oversees all projects globally and is not a project_member record.
     *
     * is_leader: selected by the PM from assigned Team Members per project.
     * date_joined: the date the employee was added to the project.
     *
     * Removed: user_id, added_by, joined_at.
     * Added: employee_id, is_leader, date_joined.
     */
    public function up(): void
    {
        Schema::create('project_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->boolean('is_leader')->default(false);
            $table->date('date_joined')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'employee_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_members');
    }
};
