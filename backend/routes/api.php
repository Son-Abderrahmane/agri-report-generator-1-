<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController;

use Illuminate\Http\Request;

Route::post('/login', function (Request $request) {
    $password = $request->input('password');
    $expectedPassword = env('ADMIN_PASSWORD');

    if (!$expectedPassword) {
        return response()->json(['error' => 'Admin password not configured'], 500);
    }

    if ($password === $expectedPassword) {
        return response()->json([
            'token' => env('ADMIN_API_TOKEN'),
            'message' => 'Login successful'
        ]);
    }

    return response()->json(['error' => 'Invalid credentials'], 401);
});

Route::middleware(['admin.auth'])->group(function () {
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/reports/{id}', [ReportController::class, 'show']);
    Route::post('/reports', [ReportController::class, 'store']);
    Route::put('/reports/{id}', [ReportController::class, 'update']);
    Route::post('/reports/{id}/duplicate', [ReportController::class, 'duplicate']);
    Route::delete('/reports/{id}', [ReportController::class, 'destroy']);
    Route::post('/upload', [ReportController::class, 'upload']);
});
