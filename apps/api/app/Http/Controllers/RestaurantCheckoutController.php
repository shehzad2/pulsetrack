<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderTrackingEvent;
use App\Models\Product;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;
use PulseTrack\ServerSdk\PulseTrack;
use Illuminate\Support\Facades\Log;

class RestaurantCheckoutController extends Controller
{
    public function __construct(
        private readonly PulseTrack $pulsetrack,
    ) {}
    public function index(): View
    {
        return view('restaurant.checkout');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string', 'max:1000'],
            'city' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
            'payment_method' => ['required', 'in:cod'],

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

        $projectKey = config('app.pulsetrack_public_key')
            ?: env('PULSETRACK_PUBLIC_KEY');

        $project = Project::where('public_key', $projectKey)
            ->firstOrFail();

        $authenticatedUser = Auth::guard('sanctum')->user();

        $order = DB::transaction(function () use (
            $data,
            $authenticatedUser
        ) {
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

                if (! $product) {
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

            $order = Order::create([
                'user_id' => $authenticatedUser?->id,
                'order_number' => (string) Str::uuid(),
                'customer_name' => $data['customer_name'],
                'phone' => $data['phone'],
                'address' => $data['address'],
                'city' => $data['city'],
                'postal_code' => $data['postal_code'],
                'items' => $items,
                'total_amount' => round($total, 2),
                'currency' => 'INR',
                'payment_method' => $data['payment_method'],
                'status' => 'created',
            ]);

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
        try {
            $this->pulsetrack->track('order_created', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'total_amount' => (float) $order->total_amount,
                'currency' => $order->currency,
                'payment_method' => $order->payment_method,
            ]);
        } catch (\Throwable $e) {
            // Analytics failure must not prevent a successful order.
            Log::warning('PulseTrack order event failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
        }
       return redirect()->route('restaurant.thank-you', [
    'orderId' => $order->id,
]);
    }
}
