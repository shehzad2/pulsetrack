<?php

return [
    'endpoint' => env('PULSETRACK_ENDPOINT', 'http://127.0.0.1:8000'),
    'project_key' => env('PULSETRACK_PROJECT_KEY'),
    'server_key' => env('PULSETRACK_SERVER_KEY'),
    'timeout' => (int) env('PULSETRACK_TIMEOUT', 5),

    'middleware' => [
        'page_views' => true,

        'excluded_paths' => [
            'up',
            'sanctum/*',
            '_debugbar/*',
        ],
    ],
];
