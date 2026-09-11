<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes for Cepat UI
|--------------------------------------------------------------------------
|
| Include these routes inside your Laravel `routes/api.php` file.
| These match the default endpoints expected by LaravelSanctumAdapter:
|
| - POST /api/login
| - POST /api/register
| - POST /api/logout (Sanctum protected)
| - GET  /api/user   (Sanctum protected)
|
*/

// Public Authentication Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected Routes (Requires Bearer Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Add your application API resources here:
    // Route::apiResource('users', UserController::class);
    // Route::apiResource('products', ProductController::class);
});
