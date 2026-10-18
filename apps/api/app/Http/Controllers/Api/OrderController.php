<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderTrackingEvent;
use App\Models\Product;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        // Validate checkout and delivery details.
        $data = $request->validate([
            'public_key' => [
                    'required',
                    'string',
                    'exists:projects,public_key',
                ],
            'customer_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string', 'max:1000'],
            'city' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
             'payment_method' => ['sometimes', 'in:cod'],

            'items' => ['required', 'array', 'min:1', 'max:20'],
            'items.*.product_id' => [
                'required',
                'integer',
                'distinct',
                'exists:products,id',
            ],
            'items.*.quantity' => [
                'required',
                'integer',
                'min:1',
                'max:20',
            ],
        ]);

        // Find the analytics project.
      $project = Project::where(
                'public_key',
                $data['public_key']
            )->firstOrFail();

        /*
         * Resolve an optional Sanctum bearer token.
         * Authentication is not mandatory, so guest checkout remains available.
         */
        $authenticatedUser = Auth::guard('sanctum')->user();

        $order = DB::transaction(function () use (
            $data,
            $project,
            $request,
            $authenticatedUser
        ) {
            // Load active products and use their database prices.
            $productIds = collect($data['items'])
                ->pluck('product_id')
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->values();

            $products = Product::query()
                ->whereIn('id', $productIds)
                ->where('is_active', true)
                ->get()
                ->keyBy('id');

            $items = [];
            $total = 0;

            foreach ($data['items'] as $item) {
                $productId = (int) $item['product_id'];
                $product = $products->get($productId);

                if (!$product) {
                    throw ValidationException::withMessages([
                        'items' => [
                            "Product ID {$productId} is unavailable.",
                        ],
                    ]);
                }

                $quantity = (int) $item['quantity'];
                $unitPrice = (float) $product->price;
                $lineTotal = round($unitPrice * $quantity, 2);

                $items[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $unitPrice,
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                ];

                $total += $lineTotal;
            }

            $total = round($total, 2);

            // Create the order and associate the authenticated customer.
            $order = Order::create([
                'user_id' => $authenticatedUser?->id,
                'order_number' => (string) Str::uuid(),
                'customer_name' => $data['customer_name'],
                'phone' => $data['phone'],
                'address' => $data['address'],
                'city' => $data['city'],
                'postal_code' => $data['postal_code'],
                'items' => $items,
                'total_amount' => $total,
                'currency' => 'INR',
                'payment_method' => $data['payment_method'] ?? 'cod',
                'status' => 'created',
            ]);

            // Record the initial tracking event.
            OrderTrackingEvent::create([
                'order_id' => $order->id,
                'status' => 'created',
                'title' => 'Order placed',
                'description' => 'We have received your order.',
                'location' => null,
                'occurred_at' => now(),
            ]);

            return $order;
        });

        return response()->json([
            'message' => 'Order created successfully',
            'order' => $order->load('trackingEvents'),
        ], 201);
    }
}
