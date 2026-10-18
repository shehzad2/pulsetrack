# PulseTrack PHP Server SDK

The PulseTrack PHP Server SDK sends analytics events from Laravel applications to the PulseTrack API.

Use server-side tracking for confirmed business events such as order creation, subscription creation, and successful payments. Keep server credentials on the server and never expose them to browser code.

## Features

- Server-side custom event tracking
- Laravel service-container integration
- Bearer-token authentication using the project server key
- Configurable API endpoint and HTTP timeout
- Optional page-view middleware
- Laravel HTTP client integration

## Requirements

- PHP 8.2 or later
- Composer
- A Laravel application using compatible Illuminate components
- A running PulseTrack API
- A valid PulseTrack project public key and server key

The package supports the Illuminate Support and HTTP components for versions 11, 12, and 13, subject to the constraints declared in `composer.json`.

## Installation

### Install from the PulseTrack monorepo

The PHP Server SDK is located at:

```text
packages/server-sdk/
```

For local development, configure the package as a Composer path repository in `apps/api/composer.json`.

Add the following entry to the existing `repositories` array:

```json
{
  "type": "path",
  "url": "../../packages/server-sdk",
  "options": {
    "symlink": true
  }
}
```

Merge this entry into the existing configuration instead of replacing other repositories.

Ensure the SDK package's `composer.json` declares the correct package name, such as `pulsetrack/server-sdk`, and a compatible development version or branch alias.

Then install it:

```bash
cd apps/api
composer require "pulsetrack/server-sdk:*@dev"
```

Composer resolves the package from the local path repository.

If the package is already installed, use:

```bash
cd apps/api
composer install
```

### Install in an external Laravel application

For applications outside this repository, publish the package to an appropriate Composer repository or configure a Composer path repository that points to the SDK package directory.

Then install it using the package name and version available from that repository.

## Configuration

Configure the following environment variables in `apps/api/.env`:

```dotenv
PULSETRACK_ENDPOINT=http://127.0.0.1:8000
PULSETRACK_PUBLIC_KEY=YOUR_PULSETRACK_PUBLIC_KEY
PULSETRACK_SERVER_KEY=YOUR_PULSETRACK_SERVER_KEY
PULSETRACK_TIMEOUT=5
```

Replace the example values with your actual project configuration.

| Setting | Purpose |
|---|---|
| `PULSETRACK_ENDPOINT` | Base URL of the PulseTrack API |
| `PULSETRACK_PUBLIC_KEY` | Public key identifying the PulseTrack project |
| `PULSETRACK_SERVER_KEY` | Secret bearer key used for server authentication |
| `PULSETRACK_TIMEOUT` | HTTP request timeout in seconds |

For local development, the API endpoint may be `http://127.0.0.1:8000`. Use your deployed HTTPS API URL in production.

The SDK configuration is defined in `config/pulsetrack.php`. Ensure it maps the environment variables to the configuration keys expected by the SDK:

- `endpoint`
- `public_key`
- `server_key`
- `timeout`

After changing environment variables or configuration, clear Laravel's cached configuration:

```bash
cd apps/api
php artisan optimize:clear
```

**Security:** Never commit real server keys to source control. Do not expose `PULSETRACK_SERVER_KEY` through frontend environment variables, browser JavaScript, HTML, or public repositories.

## Track an event

Inject `PulseTrack` into a Laravel service or controller:

```php
<?php

namespace App\Services;

use PulseTrack\ServerSdk\PulseTrack;

class AnalyticsService
{
    public function __construct(
        private PulseTrack $pulsetrack,
    ) {}

    public function recordAction(): void
    {
        $this->pulsetrack->track('subscription_created', [
            'plan' => 'pro',
            'amount' => 499,
            'currency' => 'INR',
        ]);
    }
}
```

The `track()` method accepts an event name and an optional associative array of properties. Additional options should be used only if supported by the installed SDK implementation.

Use meaningful event names and properties. Do not include passwords, access tokens, payment credentials, or other sensitive information in analytics events.

## Track a confirmed order

Send an order event after the order has been successfully persisted:

```php
try {
    $this->pulsetrack->track('order_created', [
        'order_id' => (string) $order->id,
        'order_number' => $order->order_number,
        'total_amount' => (float) $order->total_amount,
        'currency' => $order->currency,
        'payment_method' => $order->payment_method,
    ]);
} catch (\Throwable $e) {
    \Illuminate\Support\Facades\Log::warning(
        'PulseTrack order event failed',
        [
            'order_id' => $order->id,
            'error' => $e->getMessage(),
        ]
    );
}
```

Adapt the properties to your application's order model.

Keep analytics delivery separate from the main business operation when analytics failure should not interrupt a successfully created order. For reliable delivery across failures, consider an outbox or queued-event design.

Use distinct event names for distinct business milestones. For example, `order_created` should not automatically mean that payment succeeded.

## Laravel dependency injection

The package provides the service provider:

```php
PulseTrack\ServerSdk\PulseTrackServiceProvider
```

It registers the `PulseTrack` client in Laravel's service container.

Laravel package auto-discovery can register the provider if the package's Composer metadata enables it. If your application explicitly registers providers in `apps/api/bootstrap/providers.php`, ensure the provider is listed there.

You can inject the SDK into controllers and services:

```php
use PulseTrack\ServerSdk\PulseTrack;

public function __construct(
    private PulseTrack $pulsetrack,
) {}
```

The package also registers the `pulsetrack` alias, according to its current implementation.

## Page-view middleware

The package includes:

```text
src/Http/Middleware/TrackPageViews.php
```

This middleware can be registered in Laravel's web middleware stack if required.

Review the middleware implementation and test it in your environment before enabling it. If the Browser SDK already tracks page views, enabling server-side page-view tracking on the same routes may create duplicate events.

Choose the tracking source intentionally for each event type.

## Authentication and event delivery

The SDK sends events to:

```text
POST /api/v1/events
```

The request includes the public project key in the JSON payload and the server key in the HTTP bearer authorization header.

The API uses the public key to identify the project and validates the server key before accepting a server-originated event. Accepted server events should be stored with:

```text
source = server
```

Browser events use the public project key without the server bearer key and are stored with:

```text
source = browser
```

The server key is a secret. Never put it in frontend code, browser storage, public repositories, or client-visible environment variables. Rotate any credential that may have been exposed.

## Error handling

The SDK uses Laravel's HTTP client. According to its implementation, unsuccessful HTTP responses can throw exceptions.

Catch exceptions around analytics calls when analytics failures must not interrupt the main business operation:

```php
try {
    $this->pulsetrack->track('order_created', [
        'order_id' => (string) $order->id,
    ]);
} catch (\Throwable $e) {
    \Illuminate\Support\Facades\Log::warning(
        'PulseTrack event failed',
        [
            'order_id' => $order->id,
            'error' => $e->getMessage(),
        ]
    );
}
```

Avoid logging credentials, authorization headers, or sensitive customer data.

The SDK's event-delivery behavior should be verified against the installed implementation. Do