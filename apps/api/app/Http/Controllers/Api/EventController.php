<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'project_key' => ['required', 'string', 'max:100'],
            'event_id' => ['required', 'uuid'],
            'event_name' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-zA-Z][a-zA-Z0-9_]*$/',
            ],
            'anonymous_id' => ['required', 'string', 'max:100'],
            'session_id' => ['required', 'string', 'max:100'],
            'user_id' => ['nullable', 'string', 'max:255'],
            'timestamp' => ['required', 'date'],
            'properties' => ['sometimes', 'array', 'max:50'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid event payload',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $project = Project::where('public_key', $data['project_key'])
            ->first();

        if (!$project) {
            return response()->json([
                'message' => 'Invalid project key',
            ], 401);
        }

        $serverKey = $request->bearerToken();
        $source = 'browser';

        if ($serverKey !== null) {
            $storedHash = $project->server_key_hash;

            if (
                !$storedHash ||
                !hash_equals($storedHash, hash('sha256', $serverKey))
            ) {
                return response()->json([
                    'message' => 'Invalid server key',
                ], 401);
            }

            $source = 'server';
        }

        $event = DB::transaction(function () use (
            $data,
            $project,
            $source
        ) {
            return Event::firstOrCreate(
                [
                    'project_id' => $project->id,
                    'event_id' => $data['event_id'],
                ],
                [
                    'event_name' => $data['event_name'],
                    'anonymous_id' => $data['anonymous_id'],
                    'session_id' => $data['session_id'],
                    'user_id' => $data['user_id'] ?? null,
                    'event_timestamp' => $data['timestamp'],
                    'source' => $source,
                    'properties' => $data['properties'] ?? [],
                ]
            );
        });

        return response()->json([
            'message' => 'Event accepted',
            'event_id' => $event->event_id,
        ], 202);
    }
}
