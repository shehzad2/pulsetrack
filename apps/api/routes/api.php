
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CustomerOrderController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AdminAuthController;

Route::prefix('v1/admin')->group(function () {
       Route::post('/register', [AdminAuthController::class, 'register'])
    ->middleware('throttle:5,1');
    Route::post('/login', [AdminAuthController::class, 'login'])
        ->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::get('/projects', [AdminAuthController::class, 'projects']);

        Route::post('/projects', [
            AdminAuthController::class,
            'createProject',
        ]);

        Route::post('/logout', [AdminAuthController::class, 'logout']);
    });
});
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::prefix('v1')->group(function () {
    Route::post('/auth/request-otp', [AuthController::class, 'requestOtp'])
        ->middleware('throttle:10,1');

    Route::post('/auth/verify-otp', [AuthController::class, 'verifyOtp'])
        ->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
    });
});
Route::post('/v1/events', [EventController::class, 'store']);
Route::get('/v1/products', [ProductController::class, 'index']);
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::get('/orders', [CustomerOrderController::class, 'index']);

    Route::get('/orders/{orderId}/tracking', [
        CustomerOrderController::class,
        'tracking',
    ]);

    Route::get('/orders/{orderId}', [
        CustomerOrderController::class,
        'show',
    ]);
});

Route::post('/v1/orders', [OrderController::class, 'store'])
    ->middleware('throttle:10,1');

Route::prefix('v1/analytics')
    ->middleware('auth:sanctum')
    ->group(function () {
        Route::get('/summary', [AnalyticsController::class, 'summary'])
            ->middleware('throttle:60,1');

        Route::get('/popular-pages', [
            AnalyticsController::class,
            'popularPages',
        ])->middleware('throttle:60,1');

        Route::get('/event-trends', [
            AnalyticsController::class,
            'eventTrends',
        ])->middleware('throttle:60,1');
    });
