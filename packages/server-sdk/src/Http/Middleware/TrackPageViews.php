<?php

namespace PulseTrack\ServerSdk\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use PulseTrack\ServerSdk\PulseTrack;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class TrackPageViews
{
    public function __construct(
        private readonly PulseTrack $pulsetrack,
    ) {}

    public function handle(
        Request $request,
        Closure $next,
    ): Response {
        $response = $next($request);

        if (! $this->shouldTrack($request, $response)) {
            return $response;
        }

        try {
            $session = $request->hasSession()
                ? $request->session()
                : null;

            $anonymousId = $session
                ? $session->get('pulsetrack_anonymous_id')
                : null;

            if (! $anonymousId) {
                $anonymousId = (string) Str::uuid();

                if ($session) {
                    $session->put(
                        'pulsetrack_anonymous_id',
                        $anonymousId,
                    );
                }
            }

            $sessionId = $session
                ? $session->getId()
                : $anonymousId;

            $this->pulsetrack->track(
                'page_view',
                [
                    'page_path' => '/'.ltrim(
                        $request->path(),
                        '/',
                    ),
                    'page_title' => null,
                    'http_method' => 'GET',
                    'route_name' => $request->route()?->getName(),
                    'referrer' => $request->headers->get('referer'),
                ],
                [
                    'anonymous_id' => $anonymousId,
                    'session_id' => $sessionId,
                    'user_id' => $request->user()?->getAuthIdentifier(),
                ],
            );
        } catch (Throwable $exception) {
            // Analytics must never break the page response.
            Log::warning('PulseTrack page-view tracking failed', [
                'path' => $request->path(),
                'exception' => $exception::class,
            ]);
        }

        return $response;
    }

    private function shouldTrack(
        Request $request,
        Response $response,
    ): bool {
        if (! config('pulsetrack.middleware.page_views', true)) {
            return false;
        }

        if (! $request->isMethod('GET')) {
            return false;
        }

        if (
            $request->is('api/*')
            || $request->expectsJson()
            || $request->ajax()
        ) {
            return false;
        }

        if ($response->getStatusCode() < 200
            || $response->getStatusCode() >= 300) {
            return false;
        }

        $contentType = $response->headers->get('Content-Type', '');

        if (! str_contains(strtolower($contentType), 'text/html')) {
            return false;
        }

        $excludedPaths = config(
            'pulsetrack.middleware.excluded_paths',
            [],
        );

        foreach ($excludedPaths as $path) {
            if ($request->is($path)) {
                return false;
            }
        }

        return true;
    }
}
