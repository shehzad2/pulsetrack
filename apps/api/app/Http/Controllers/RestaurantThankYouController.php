<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class RestaurantThankYouController extends Controller
{
    public function index(): View
    {
        return view('restaurant.thank-you');
    }
}