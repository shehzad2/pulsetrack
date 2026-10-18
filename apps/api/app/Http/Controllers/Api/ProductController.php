<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::query()
            ->where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get([
                'id',
                'sku',
                'name',
                'slug',
                'description',
                'category',
                'price',
                'image_url',
            ]);

        return response()->json([
            'data' => $products,
        ]);
    }
}
