<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\MasterDataController;

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
    Route::post('/upload', [\App\Http\Controllers\ReportController::class, 'upload']);
    
    // Fertigation Engine
    Route::post('/fertigation/calculate', [\App\Http\Controllers\FertigationController::class, 'calculate']);

    // Master Data Routes
    Route::get('/crops', [MasterDataController::class, 'getCrops']);
    Route::post('/crops', [MasterDataController::class, 'storeCrop']);
    Route::put('/crops/{id}', [MasterDataController::class, 'updateCrop']);
    Route::delete('/crops/{id}', [MasterDataController::class, 'destroyCrop']);

    Route::get('/pesticides', [MasterDataController::class, 'getPesticides']);
    Route::post('/pesticides/import', [MasterDataController::class, 'importPesticides']);
    Route::post('/pesticides', [MasterDataController::class, 'storePesticide']);
    Route::put('/pesticides/{id}', [MasterDataController::class, 'updatePesticide']);
    Route::delete('/pesticides/all', [MasterDataController::class, 'deleteAllPesticides']);
    Route::delete('/pesticides/{id}', [MasterDataController::class, 'destroyPesticide']);

    Route::get('/quick-formulas', [MasterDataController::class, 'getQuickFormulas']);
    Route::post('/quick-formulas', [MasterDataController::class, 'storeQuickFormula']);
    Route::put('/quick-formulas/{id}', [MasterDataController::class, 'updateQuickFormula']);
    Route::delete('/quick-formulas/{id}', [MasterDataController::class, 'destroyQuickFormula']);

    Route::get('/evaluation-templates', [MasterDataController::class, 'getEvaluationTemplates']);
    Route::post('/evaluation-templates', [MasterDataController::class, 'storeEvaluationTemplate']);
    Route::put('/evaluation-templates/{id}', [MasterDataController::class, 'updateEvaluationTemplate']);
    Route::delete('/evaluation-templates/{id}', [MasterDataController::class, 'destroyEvaluationTemplate']);
});
