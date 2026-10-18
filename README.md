## Install and Configure the PHP Server SDK

The PulseTrack PHP Server SDK is located at `packages/server-sdk`. It integrates with Laravel through Composer and uses Laravel's HTTP client to send server-side analytics events.

### 1. Install the SDK from the local repository

From the repository root, first register the local package in `apps/api/composer.json` under `repositories`:

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "../../packages/server-sdk",
      "options": {
        "symlink": true
      }
    }
  ]
}
```

Merge this entry into the existing `repositories` array if one is already present; do not overwrite other repository definitions.

Then install the package:

```bash
cd apps/api
composer install
composer require "pulsetrack/server-sdk:*@dev"

```

The SDK package name is `pulsetrack/server-sdk`. The local path repository lets Composer load the package directly from this monorepo without requiring a published Packagist package.

### 2. Configure environment variables

Add the following settings to `apps/api/.env`:

```dotenv
PULSETRACK_ENDPOINT=http://127.0.0.1:8000
PULSETRACK_PROJECT_KEY=YOUR_PROJECT_PUBLIC_KEY
PULSETRACK_SERVER_KEY=YOUR_PROJECT_SERVER_KEY
PULSETRACK_TIMEOUT=5
```

Replace the example key values with the keys generated for your PulseTrack project.

- `PULSETRACK_ENDPOINT`: Base URL of the PulseTrack API.
- `PULSETRACK_PROJECT_KEY`: Public project key identifying the project.
- `PULSETRACK_SERVER_KEY`: Secret key used for server-side authentication.
- `PULSETRACK_TIMEOUT`: HTTP request timeout in seconds.

Keep `PULSETRACK_SERVER_KEY` on the server. Never expose it in browser JavaScript or frontend environment variables.

### 3. Configure Laravel

The SDK provides the Laravel service provider:

`PulseTrack\ServerSdk\PulseTrackServiceProvider`

Laravel package auto-discovery can register the provider when configured in the package's Composer metadata. If your application explicitly registers providers in `apps/api/bootstrap/providers.php`, ensure this provider is registered there as well.

The SDK uses these configuration keys:

- `endpoint`
- `project_key`
- `server_key`
- `timeout`

Make sure `apps/api/config/pulsetrack.php` maps these settings to the corresponding `PULSETRACK_*` environment variables.

After changing configuration, refresh Laravel's configuration cache if necessary:

```bash
cd apps/api
php artisan config:clear
```

### 4. Send a server-side event

Inject the SDK into a Laravel controller:

```php
use Illuminate\Support\Facades\Log;
use PulseTrack\ServerSdk\PulseTrack;

class CheckoutController
{
    public function __construct(
        private PulseTrack $pulsetrack
    ) {}

    public function example()
    {
        $this->pulsetrack->track('order_created', [
            'order_id' => 'ORDER-1001',
            'total_amount' => 1499,
            'currency' => 'INR',
            'payment_method' => 'cod',
        ]);

        return response()->json([
            'message' => 'Order event submitted',
        ]);
    }
}
```

This is an integration example; in a real checkout, send the event after the order has been successfully persisted. Use the actual order ID and values rather than hard-coded example data.

The SDK sends the event to the PulseTrack API using the configured endpoint, public project key, and server bearer key. The API validates the key and records accepted events with `source = server`.

### 5. Verify the server SDK

Run the API test suite:

```bash
cd apps/api
php artisan test --filter=EventIngestionTest
php artisan test --filter=AnalyticsTest
```

To inspect saved server events in Laravel Tinker:

```php
\App\Models\Event::where('source', 'server')
    ->orderByDesc('event_timestamp')
    ->limit(10)
    ->get([
        'event_name',
        'source',
        'properties',
        'event_timestamp',
    ]);
```

---

## Install and Configure the Browser SDK

The PulseTrack Browser SDK is located at `packages/browser-sdk`. It collects website activity and sends events from the browser to the PulseTrack API.

### 1. Build the SDK

From the repository root:

```bash
cd packages/browser-sdk
npm install
npm run build
npm test
```

### 2. Install it in the Restaurant Demo

For a local monorepo installation, use the local package directory if the demo is configured to consume the package through a local file dependency:

```bash
cd apps/restaurant-demo
npm install ../../packages/browser-sdk
```

If `apps/restaurant-demo/package.json` already declares `@pulsetrack/browser-sdk` as a workspace or local dependency, keep that existing dependency configuration and run `npm install` instead.

### 3. Configure the browser SDK

Configure the SDK in the frontend, for example in `apps/restaurant-demo/src/config.ts`:

```typescript
export const PULSETRACK_CONFIG = {
  endpoint: 'http://127.0.0.1:8000',
  projectKey: 'YOUR_PROJECT_PUBLIC_KEY',
};
```

Use the public key belonging to the Restaurant Demo's PulseTrack project. The browser must never receive the server key.

### 4. Initialize analytics

In `apps/restaurant-demo/src/analytics.ts`:

```typescript
import { PulseTrack } from '@pulsetrack/browser-sdk';
import { PULSETRACK_CONFIG } from './config';

export const analytics = new PulseTrack({
  endpoint: PULSETRACK_CONFIG.endpoint,
  projectKey: PULSETRACK_CONFIG.projectKey,
  autoTrackPageViews: true,
});
```

With automatic page-view tracking enabled, the SDK sends an initial `page_view` event when it is initialized.

### 5. Track custom events

Import the initialized analytics client where required:

```typescript
import { analytics } from './analytics';

analytics.track('button_clicked', {
  button_name: 'checkout',
});
```

Use meaningful event names and non-sensitive properties. Never send passwords, payment credentials, or other confidential information as analytics properties.

### 6. Run and verify the Browser SDK

Start the demo:

```bash
cd apps/restaurant-demo
npm run dev
```

Open the URL printed by Vite, then use browser Developer Tools → Network to inspect requests to:

`POST /api/v1/events`

Confirm that:

- The request payload includes the correct `public_key`.
- The API accepts the event.
- The saved event has `source = browser`.
- Page views and custom events appear in the analytics data.

The Browser SDK uses the public project key only. Server-side events use the secret bearer key through the PHP Server SDK.

---

## SDK Authentication and Event Sources

| Integration | Authentication | Expected event source |
|---|---|---|
| Browser SDK | Public project key | `browser` |
| PHP Server SDK | Public project key and server bearer key | `server` |

The API validates the project public key to identify the project. Server-side requests must also provide a valid server key. Requests without a bearer token are treated as browser events by the current ingestion implementation.

## Production Security

- Keep server keys in server-side environment variables.
- Never commit real secrets to version control.
- Use HTTPS for production API communication.
- Rotate any server key that may have been exposed.
- Confirm that the API rejects invalid server keys.
- Ensure that checkout events are sent only after the corresponding business operation succeeds.
