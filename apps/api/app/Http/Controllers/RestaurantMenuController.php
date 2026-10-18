<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\View\View;

class RestaurantMenuController extends Controller
{
    public function index(): View
    {
        $products = Product::query()
            ->where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        $categories = $products
            ->pluck('category')
            ->filter()
            ->unique()
            ->values();

        return view('restaurant.products', compact('products', 'categories'));
    }
}
