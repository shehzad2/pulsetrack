<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class RestaurantAccountController extends Controller
{
    public function index(): View
    {
        return view('restaurant.account');
    }
}