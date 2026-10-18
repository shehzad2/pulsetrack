<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Event;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnalyticsController extends Controller
{
    private function authorizeProject(Request $request): ?Project
    {
        $admin = $request->user();
        $publicKey = $request->query('public_key');

        if (
            !$admin instanceof Admin ||
            !$admin->is_active ||
            !is_string($publicKey) ||
            $publicKey === ''
        ) {
            return null;
        }

        return Project::query()
            ->where('admin_id', $admin->id)
            ->where('public_key', $publicKey)
            ->first();
    }

    private function dateRange(Request $request): array
    {
        $validator = Validator::make($request->query(), [
            'from' => ['sometimes', 'date'],
            'to' => ['sometimes', 'date', 'after_or_equal:from'],
        ]);

        if ($validator->fails()) {
            abort(response()->json([
                'message' => 'Invalid date range',
                'errors' => $validator->errors(),
            ], 422));
        }

        return [
            $request->query('from'),
            $request->query('to'),
        ];
    }


private function filteredEvents(
    Project $project,
    ?string $from,
    ?string $to
) {
    return Event::query()
        ->where('project_id', $project->id)
        ->when($from, fn ($query) => $query->where(
            'event_timestamp',
            '>=',
            Carbon::parse($from)->startOfDay()
        ))
        ->when($to, fn ($query) => $query->where(
            'event_timestamp',
            '<',
            Carbon::parse($to)->addDay()->startOfDay()
        ));
}


    public function summary(Request $request): JsonResponse
    {
        $project = $this->authorizeProject($request);

        if (!$project) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        [$from, $to] = $this->dateRange($request);
        $events = $this->filteredEvents($project, $from, $to);

        $orderGroups = (clone $events)
            ->where('event_name', 'order_created')
            ->get(['properties'])
            ->map(fn (Event $event) => $event->properties ?? [])
            ->filter(fn (array $properties) =>
                isset($properties['order_id']) &&
                (is_string($properties['order_id']) || is_int($properties['order_id'])) &&
                trim((string) $properties['order_id']) !== ''
            )
            ->groupBy(fn (array $properties) => (string) $properties['order_id']);

        $ordersCreated = $orderGroups->count();

        $orderValue = $orderGroups->sum(function ($records): float {
            // Count the amount for an order only once, even if its
            // order_created event was delivered more than once.
            foreach ($records as $properties) {
                $amount = $properties['total_amount'] ?? null;

                if (
                    (is_int($amount) || is_float($amount) ||
                        (is_string($amount) && trim($amount) !== '')) &&
                    is_numeric($amount) &&
                    is_finite((float) $amount) &&
                    (float) $amount >= 0
                ) {
                    return (float) $amount;
                }
            }

            return 0.0;
        });

        return response()->json([
            'total_events' => (clone $events)->count(),
            'page_views' => (clone $events)
                ->where('event_name', 'page_view')
                ->count(),
            'unique_visitors' => (clone $events)
                ->distinct()
                ->count('anonymous_id'),
            'unique_sessions' => (clone $events)
                ->distinct()
                ->count('session_id'),
            'orders_created' => $ordersCreated,
            'order_value' => round($orderValue, 2),
        ]);
    }

    public function popularPages(Request $request): JsonResponse
    {
        $project = $this->authorizeProject($request);

        if (!$project) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        [$from, $to] = $this->dateRange($request);

        $pages = $this->filteredEvents($project, $from, $to)
            ->where('event_name', 'page_view')
            ->selectRaw(
                "COALESCE(properties->>'page_path', properties->>'path', '/') AS path, COUNT(*) AS views"
            )
            ->groupByRaw(
                "COALESCE(properties->>'page_path', properties->>'path', '/')"
            )
            ->orderByDesc('views')
            ->limit(10)
            ->get();

        return response()->json(['pages' => $pages]);
    }

    public function eventTrends(Request $request): JsonResponse
    {
        $project = $this->authorizeProject($request);

        if (!$project) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        [$from, $to] = $this->dateRange($request);

        $trends = $this->filteredEvents($project, $from, $to)
            ->selectRaw(
                'DATE(event_timestamp) AS date, event_name, COUNT(*) AS total'
            )
            ->groupByRaw('DATE(event_timestamp), event_name')
            ->orderBy('date')
            ->orderBy('event_name')
            ->get();

        return response()->json(['trends' => $trends]);
    }
}
