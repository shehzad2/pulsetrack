<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\View\View;

class RestaurantStoreController extends Controller
{
    public function index(): View
    {
        $products = Product::query()
            ->where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return view('restaurant.store', compact('products'));
    }
}