<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DownloadController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UploadLinkController;
use Illuminate\Support\Facades\Route;

// Аутентификация
Route::post('/auth/login', [AuthController::class, 'login']);

// Маршруты, требующие аутентификации
Route::middleware('auth:sanctum')->group(function () {
    // Управление ссылками для загрузки
    Route::post('/upload-links', [UploadLinkController::class, 'create']);
    Route::get('/upload-links', [UploadLinkController::class, 'index']); // Новый маршрут
    Route::get('/upload-links/{link_id}/status', [UploadLinkController::class, 'status']);
});

// Маршруты для загрузки и скачивания (не требуют аутентификации)
Route::post('/upload/{link_id}', [UploadController::class, 'upload']);
Route::get('/download/{link_id}', [DownloadController::class, 'download']);
Route::get('/download/{link_id}/info', [DownloadController::class, 'info']); // Новый маршрут