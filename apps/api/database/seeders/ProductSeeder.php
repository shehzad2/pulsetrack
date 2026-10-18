<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'sku' => 'burger-001',
                'name' => 'Classic Burger',
                'slug' => 'classic-burger',
                'description' => 'Juicy burger with fresh vegetables and sauce.',
                'category' => 'Burgers',
                'price' => 249,
                'image_url' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
                'is_active' => true,
            ],
            [
                'sku' => 'pizza-001',
                'name' => 'Margherita Pizza',
                'slug' => 'margherita-pizza',
                'description' => 'Classic pizza with tomato, mozzarella and basil.',
                'category' => 'Pizza',
                'price' => 299,
                'image_url' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',
                'is_active' => true,
            ],
            [
                'sku' => 'fries-001',
                'name' => 'Crispy Fries',
                'slug' => 'crispy-fries',
                'description' => 'Golden, crispy fries served hot.',
                'category' => 'Sides',
                'price' => 129,
                'image_url' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80',
                'is_active' => true,
            ],
            [
                'sku' => 'drink-001',
                'name' => 'Fresh Lemonade',
                'slug' => 'fresh-lemonade',
                'description' => 'Refreshing lemonade served chilled.',
                'category' => 'Drinks',
                'price' => 99,
                'image_url' => 'https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?auto=format&fit=crop&w=900&q=80',
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['sku' => $product['sku']],
                $product
            );
        }
    }
}
