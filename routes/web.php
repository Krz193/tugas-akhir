<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {

    // Users
    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Projects
    Route::get('projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::patch('projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

    // Project members — identified by employee_id
    Route::post('projects/{project}/members', [ProjectController::class, 'addMember'])->name('projects.members.store');
    Route::delete('projects/{project}/members/{employee}', [ProjectController::class, 'removeMember'])->name('projects.members.destroy');

    // Tasks
    Route::get('projects/{project}/tasks', [TaskController::class, 'index'])->name('projects.tasks.index');
    Route::post('projects/{project}/tasks', [TaskController::class, 'store'])->name('projects.tasks.store');
    Route::get('my-tasks', [TaskController::class, 'myTasks'])->name('tasks.my');
    Route::get('tasks/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::patch('tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::patch('tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.status.update');
    Route::delete('tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

    // Project messages (ProjectMessage model — message_project table)
    Route::get('projects/{project}/messages', [MessageController::class, 'indexProject'])->name('projects.messages.index');
    Route::post('projects/{project}/messages', [MessageController::class, 'storeProject'])->name('projects.messages.store');

    // Task thread messages (Thread → Message)
    Route::get('tasks/{task}/messages', [MessageController::class, 'indexTask'])->name('tasks.messages.index');
    Route::post('tasks/{task}/messages', [MessageController::class, 'storeTask'])->name('tasks.messages.store');

    // Message edit/delete (task thread messages only)
    Route::patch('messages/{message}', [MessageController::class, 'update'])->name('messages.update');
    Route::delete('messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');
});

require __DIR__ . '/settings.php';
