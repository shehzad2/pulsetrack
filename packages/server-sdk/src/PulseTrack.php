<?php

namespace PulseTrack\ServerSdk;

use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\RequestException;
use InvalidArgumentException;

class PulseTrack
{
    public function __construct(
        private readonly HttpFactory $http,
        private readonly array $config,
    ) {
        if (empty($this->config['endpoint'])) {
            throw new InvalidArgumentException(
                'PulseTrack endpoint is required.'
            );
        }

        if (empty($this->config['project_key'])) {
            throw new InvalidArgumentException(
                'PulseTrack project key is required.'
            );
        }

        if (empty($this->config['server_key'])) {
            throw new InvalidArgumentException(
                'PulseTrack server key is required.'
            );
        }
    }

    /**
     * Send a server-side analytics event to PulseTrack.
     *
     * @throws RequestException
     */
    public function track(
        string $eventName,
        array $properties = [],
        array $options = [],
    ): void {
        if (! preg_match('/^[a-zA-Z][a-zA-Z0-9_]{0,99}$/', $eventName)) {
            throw new InvalidArgumentException(
                'Invalid PulseTrack event name.'
            );
        }

        $endpoint = rtrim($this->config['endpoint'], '/');

        $payload = [
            'project_key' => $this->config['project_key'],
            'event_id' => (string) \Illuminate\Support\Str::uuid(),
            'event_name' => $eventName,
            'anonymous_id' => $options['anonymous_id']
                ?? 'server-'.\Illuminate\Support\Str::uuid(),
            'session_id' => $options['session_id']
                ?? 'server-'.\Illuminate\Support\Str::uuid(),
            'user_id' => $options['user_id'] ?? null,
            'timestamp' => isset($options['timestamp'])
                ? \Illuminate\Support\Carbon::parse($options['timestamp'])->toISOString()
                : now()->toISOString(),
            'properties' => $properties,
            'source' => 'server',
        ];

        $response = $this->http
            ->withToken($this->config['server_key'])
            ->acceptJson()
            ->timeout((int) ($this->config['timeout'] ?? 5))
            ->post($endpoint.'/api/v1/events', $payload);

        $response->throw();
    }
}
