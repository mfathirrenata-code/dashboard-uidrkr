<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\KaliController;
use App\Http\Controllers\SpkluController;
use App\Http\Controllers\RPController;

// ==========================================
// MODUL 1: RATING PLN MOBILE
// ==========================================
Route::prefix('rating')->group(function () {
    Route::get('/rekap-ulp', [RatingController::class, 'getRekapRatingUlp']);
    Route::get('/rekap-up3', [RatingController::class, 'getRekapRatingUp3']);
    Route::get('/harian', [RatingController::class, 'getRatingHarian']);
});

// ==========================================
// MODUL 2: TRANSAKSI (Kali Transaksi & Rupiah)
// ==========================================
Route::prefix('transaksi')->group(function () {
    Route::get('/dashboard', [KaliController::class, 'getDashboard']);
    Route::get('/data-pusat', [KaliController::class, 'getDataPusat']);
    Route::get('/real-up3', [KaliController::class, 'getRekapUp3']);
    Route::get('/real-ulp-kom', [KaliController::class, 'getRealUlpKom']);
    Route::get('/real-ulp', [KaliController::class, 'getRealUlp']);
});
// ==========================================
// MODUL 3: SKPLU
// ==========================================
Route::prefix('spklu')->group(function () {
    Route::get('/data', [SpkluController::class, 'getDataSpklu']);
    Route::get('/monitoring', [SpkluController::class, 'getMonitoringSpklu']);
});
// ==========================================
// MODUL 4: Rupiah Transaksi
// ==========================================
Route::prefix('rupiah')->group(function () {
    Route::get('/dashboard', [RPController::class, 'getDashboard']);
    Route::get('/data-pusat', [RPController::class, 'getDataPusat']);
    Route::get('/rekap-up3', [RPController::class, 'getRekapUp3']);
    Route::get('/real-ulp-kom', [RPController::class, 'getRealUlpKom']);
    Route::get('/real-up3', [RPController::class, 'getRealUp3']);
    Route::get('/real-ulp', [RPController::class, 'getRealUlp']);
    Route::get('/monitoring', [RPController::class, 'getMonitoring']);
});
