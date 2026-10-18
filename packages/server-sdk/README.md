# PulseTrack PHP Server SDK

The PulseTrack PHP Server SDK sends analytics events from Laravel applications to the PulseTrack API.

Use server-side tracking for confirmed business events such as order creation. Keep server credentials on the server and never expose them to browser code.

## Requirements

- PHP 8.2 or later.
- Laravel components supported by the package: Illuminate Support and HTTP 11, 12, or 13.
- A running PulseTrack API.
- A PulseTrack project public key and server key.

## Installation

For local development in the PulseTrack monorepo, the package is available at `packages/server-sdk`.

From the Laravel API directory:

```bash
cd apps/api
composer require pulsetrack/server-sdk:@dev
```

The package uses Composer PSR-4 autoloading and Laravel package auto-discovery.

For applications outside this repository, publish the package to a Composer repository or configure a Composer path repository pointing to the package directory before installing it.

## Configuration

Set the following environment variables in your Laravel application's `.env` file:

```dotenv
PULSETRACK_ENDPOINT=http://127.0.0.1:8000
PULSETRACK_PROJECT_KEY=YOUR_PULSETTRACK_PUBLIC_KEY
PULSETRACK_SERVER_KEY=YOUR_PULSETTRACK_SERVER_KEY
PULSETRACK_TIMEOUT=5
```

Use the deployed API URL in production. Keep `PULSETRACK_SERVER_KEY` private and do not commit real credentials to source control.

The package configuration is defined in `config/pulsetrack.php`. Its defaults are:

| Setting | Default | Purpose |
|---|---|---|
| `endpoint` | `http://127.0.0.1:8000` | PulseTrack API base URL |
| `project_key` | Environment variable | Project public key |
| `server_key` | Environment variable | Server authentication key |
| `timeout` | `5` seconds | HTTP request timeout |

## Track an event

```php
use PulseTrack\ServerSdk\PulseTrack;

class ExampleService
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

The `track()` method accepts:

- `eventName`: required event name.
- `properties`: optional associative array of event properties.
- `options`: optional array for additional event options supported by the implementation.

Event names must start with a letter and contain only letters, numbers, or underscores, up to 100 characters.

## Track a confirmed order

Call the SDK after your application has successfully created an order:

```php
$this->pulsetrack->track('order_created', [
    'order_id' => $order->id,
    'order_number' => $order->order_number,
    'total_amount' => (float) $order->total_amount,
    'currency' => $order->currency,
    'payment_method' => $order->payment_method,
]);
```

Adjust the properties to match your application. Send this event only when the order has actually been created. For reliable checkout behavior, handle analytics failures separately so they do not unintentionally turn a successful order into a failed customer request.

## Laravel dependency injection

Laravel's service provider registers the `PulseTrack` class in the service container. You can inject it into a controller or service:

```php
use PulseTrack\ServerSdk\PulseTrack;

public function __construct(
    private PulseTrack $pulsetrack,
) {}
```

The provider also registers the `pulsetrack` alias.

## Page-view middleware

The package includes `PulseTrack\ServerSdk\Http\Middleware\TrackPageViews`.

If you choose to register it in Laravel's web middleware stack, first review the middleware implementation and test its behavior in your environment. Avoid adding a second page-view source if the Browser SDK already tracks the same pages, as this can create duplicate events.

## Authentication and transport

The SDK sends events to:

`POST /api/v1/events`

It includes the project key in the JSON body and uses the server key as a bearer token. The API must validate that key against the project's stored server-key hash.

Do not put the server key in JavaScript, HTML, browser storage, public repositories, or client-visible environment variables. Rotate credentials that may have been exposed.

## Error handling

The SDK uses Laravel's HTTP client and throws for unsuccessful HTTP responses. Catch exceptions around analytics calls when analytics failure should not interrupt the main business operation:

```php
try {
    $this->pulsetrack->track('order_created', [
        'order_id' => $order->id,
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

## Verify the installation

From `apps/api`, clear Laravel's cached configuration if you changed environment variables:

```bash
php artisan optimize:clear
```

Then run a local test from Tinker:

```bash
php artisan tinker
```

Inside Tinker:

```php
app(\PulseTrack\ServerSdk\PulseTrack::class)
    ->track('sdk_connection_test', ['test' => true]);
```

Verify that the event appears in the PulseTrack database or analytics dashboard. Do not paste server keys into chat or commit them in the README.

## Package files

- `src/PulseTrack.php` — event tracking client.
- `src/PulseTrackServiceProvider.php` — Laravel service registration.
- `src/Http/Middleware/TrackPageViews.php` — optional page-view middleware.
- `config/pulsetrack.php` — SDK configuration.
