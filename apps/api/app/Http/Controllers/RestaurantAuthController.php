<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class RestaurantAuthController extends Controller
{
    public function showLogin(): View
    {
        return view('restaurant.auth', [
            'mode' => 'login',
        ]);
    }

    public function showRegister(): View
    {
        return view('restaurant.auth', [
            'mode' => 'register',
        ]);
    }
}