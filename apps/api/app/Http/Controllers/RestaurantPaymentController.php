<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class RestaurantPaymentController extends Controller
{
    public function index(): View
    {
        return view('restaurant.payment');
    }
}
