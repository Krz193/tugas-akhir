<?php

use App\Http\Controllers\DivisionLeadController;
use App\Http\Controllers\ProjectManagerTransferController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::patch('divisions/{division}/lead', [DivisionLeadController::class, 'update'])
        ->name('divisions.lead.update');
    Route::post('pm/transfer', [ProjectManagerTransferController::class, 'store'])
        ->name('pm.transfer');
});

require __DIR__.'/settings.php';
