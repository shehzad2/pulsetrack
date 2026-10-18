<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('trackingEvents')
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, string $orderId): JsonResponse
    {
        $order = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('trackingEvents')
            ->where('id', $orderId)
            ->firstOrFail();

        return response()->json(['order' => $order]);
    }

    public function tracking(Request $request, string $orderId): JsonResponse
    {
        $order = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('trackingEvents')
            ->where('id', $orderId)
            ->firstOrFail();

        return response()->json([
            'order_number' => $order->order_number,
            'status' => $order->status,
            'tracking_events' => $order->trackingEvents,
        ]);
    }
}
