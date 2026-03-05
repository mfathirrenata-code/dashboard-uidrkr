<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GoogleSheetController;

Route::get('/get-sheet-data', [GoogleSheetController::class, 'getSheetData']);