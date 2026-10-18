<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RestaurantStoreController;
use App\Http\Controllers\RestaurantMenuController;
use App\Http\Controllers\RestaurantAuthController;
use App\Http\Controllers\RestaurantAccountController;
use App\Http\Controllers\RestaurantCheckoutController;
use App\Http\Controllers\RestaurantThankYouController;
use App\Http\Controllers\RestaurantPaymentController;
use App\Http\Controllers\RestaurantProductDetailController;


Route::get('/', [RestaurantStoreController::class, 'index'])
    ->name('restaurant.store');

Route::get('/products', [RestaurantMenuController::class, 'index'])
    ->name('restaurant.products');

Route::get('/login', [RestaurantAuthController::class, 'showLogin'])
    ->name('restaurant.login');

Route::get('/register', [RestaurantAuthController::class, 'showRegister'])
    ->name('restaurant.register');

Route::get('/account', [RestaurantAccountController::class, 'index'])
    ->name('restaurant.account');

Route::get('/checkout', [RestaurantCheckoutController::class, 'index'])
    ->name('restaurant.checkout');
Route::post('/checkout', [RestaurantCheckoutController::class, 'store'])
    ->name('restaurant.checkout.store');

Route::get('/thank-you/{orderId}', [RestaurantThankYouController::class, 'index'])
    ->name('restaurant.thank-you');

Route::get('/payment/{orderId}', [RestaurantPaymentController::class, 'index'])
    ->name('restaurant.payment');

Route::get('/products/{slug}', [RestaurantProductDetailController::class, 'show'])
    ->name('restaurant.product-detail');