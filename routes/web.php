<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\GuestController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('invitations', InvitationController::class);
    
    // Guest management routes
    Route::get('guests', [GuestController::class, 'index'])->name('guests.index');
    Route::get('guests/{invitation}', [GuestController::class, 'show'])->name('guests.show');
    Route::get('guests/{invitation}/create', [GuestController::class, 'create'])->name('guests.create');
    Route::post('guests/{invitation}', [GuestController::class, 'store'])->name('guests.store');
    Route::get('guests/{invitation}/{guest}/edit', [GuestController::class, 'edit'])->name('guests.edit');
    Route::put('guests/{invitation}/{guest}', [GuestController::class, 'update'])->name('guests.update');
    Route::delete('guests/{invitation}/{guest}', [GuestController::class, 'destroy'])->name('guests.destroy');
    Route::post('guests/{invitation}/{guest}/regenerate-qr', [GuestController::class, 'regenerateQrCode'])->name('guests.regenerate-qr');
});

require __DIR__.'/settings.php';
