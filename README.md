# PulseTrack

PulseTrack is a lightweight analytics platform for tracking website activity and server-side business events. The monorepo contains the Laravel API, React admin dashboard, browser SDK, PHP server SDK, and Restaurant Demo application.

## Project Structure

```text
pulsetrack/
├── apps/
│   ├── api/                 # Laravel API
│   ├── admin/               # React admin dashboard
│   └── restaurant-demo/     # Restaurant demo frontend
├── packages/
│   ├── browser-sdk/         # TypeScript browser SDK
│   └── server-sdk/          # PHP/Laravel server SDK
├── docs/
│   └── API.md               # API documentation
├── docker-compose.yml
└── README.md
```

## Technology Stack

- **Backend:** PHP, Laravel
- **Database:** PostgreSQL
- **Admin dashboard:** React, TypeScript, Vite
- **Browser SDK:** TypeScript
- **Server SDK:** PHP and Laravel HTTP client
- **Infrastructure:** Docker Compose

## Requirements

Install the following before starting:

- Git
- Docker Desktop
- PHP 8.2 or later and required Laravel extensions
- Composer
- Node.js and npm

## 1. Clone the Repository

```bash
git clone https://github.com/shehzad2/pulsetrack.git
cd pulsetrack
```

## 2. Start PostgreSQL

From the repository root:

```bash
docker compose up -d postgres
docker compose ps
```

Confirm that the PostgreSQL container is running. The local configuration uses host port `5433`; check `docker-compose.yml` if your configuration differs.

## 3. Configure the Laravel API

```bash
cd apps/api
cp .env.example .env
```

Configure the database connection in `apps/api/.env`. For the default local Docker setup, verify these values against `docker-compose.yml`:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5433
DB_DATABASE=pulsetrack
DB_USERNAME=YOUR_DATABASE_USERNAME
DB_PASSWORD=YOUR_DATABASE_PASSWORD
```

Install PHP dependencies and generate the application key:

```bash
composer install
php artisan key:generate
```

Run database migrations and seed the database:

```bash
php artisan migrate
php artisan db:seed
```

Start the API:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

The API is now available at:

```text
http://127.0.0.1:8000
```

Keep this terminal running.

## 4. Start the Admin Dashboard

Open a **new terminal** from the repository root:

```bash
cd apps/admin
npm install
npm run dev
```

Open the local URL printed by Vite.

Configure the admin API URL using the environment variable expected by `apps/admin/src/api.ts`. Do not assume the variable name; use the one defined in the source code.

## 5. Start the Restaurant Demo

Open another terminal:

```bash
cd apps/restaurant-demo
npm install
npm run dev
```

Open the local URL printed by Vite.

The Restaurant Demo uses the Laravel API for products, authentication, checkout, and order-related operations. Its analytics configuration must use the public key belonging to the Restaurant Demo project.

## 6. Configure the PulseTrack PHP Server SDK

The PHP Server SDK is located at:

```text
packages/server-sdk/
```

### Install the local package

The SDK is maintained inside this monorepo. In `apps/api/composer.json`, ensure the local path repository is configured under `repositories`:

```json
{
  "type": "path",
  "url": "../../packages/server-sdk",
  "options": {
    "symlink": true
  }
}
```

Merge this entry into the existing `repositories` array rather than replacing existing entries.

Then, from `apps/api`, install the package if it is not already configured:

```bash
composer require "pulsetrack/server-sdk:*@dev"
```

If the dependency is already present in `composer.json` and `composer.lock`, use `composer install` instead.

### Configure server credentials

Add the settings expected by `config/pulsetrack.php` to `apps/api/.env`:

```dotenv
PULSETRACK_ENDPOINT=http://127.0.0.1:8000
PULSETRACK_PUBLIC_KEY=YOUR_PROJECT_PUBLIC_KEY
PULSETRACK_SERVER_KEY=YOUR_PROJECT_SERVER_KEY
PULSETRACK_TIMEOUT=5
```

Use the correct public and server keys for the project. Never expose `PULSETRACK_SERVER_KEY` in browser code.

### Register and use the SDK

The Laravel service provider is:

```php
PulseTrack\ServerSdk\PulseTrackServiceProvider
```

Ensure it is registered through Composer auto-discovery or `apps/api/bootstrap/providers.php`, according to the existing project configuration.

Inject the SDK into a Laravel controller or service:

```php
use PulseTrack\ServerSdk\PulseTrack;

class CheckoutController
{
    public function __construct(
        private PulseTrack $pulsetrack,
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

This is an example. In the real checkout flow, send the event only after the order has been successfully saved. Replace the sample order values with actual order data.

For additional instructions, see [`packages/server-sdk/README.md`](packages/server-sdk/README.md).

## 7. Configure the Browser SDK

The Browser SDK is located at:

```text
packages/browser-sdk/
```

### Build and test the SDK

From the repository root:

```bash
cd packages/browser-sdk
npm install
npm run build
npm test
```

### Install it in the Restaurant Demo

If the demo is configured to consume the package through a local file dependency:

```bash
cd apps/restaurant-demo
npm install ../../packages/browser-sdk
```

If the dependency is already configured in `apps/restaurant-demo/package.json`, run `npm install` instead.

### Configure the public project key

Use the existing configuration file, such as `apps/restaurant-demo/src/config.ts`:

```typescript
export const PULSETRACK_CONFIG = {
  endpoint: "http://127.0.0.1:8000",
  projectKey: "YOUR_PROJECT_PUBLIC_KEY",
};
```

Use the public key associated with the Restaurant Demo project. Do not put a server key in the frontend.

### Initialize analytics

For example, in `apps/restaurant-demo/src/analytics.ts`:

```typescript
import { PulseTrack } from "@pulsetrack/browser-sdk";
import { PULSETRACK_CONFIG } from "./config";

export const analytics = new PulseTrack({
  endpoint: PULSETRACK_CONFIG.endpoint,
  projectKey: PULSETRACK_CONFIG.projectKey,
  autoTrackPageViews: true,
});
```

### Track a custom event

```typescript
import { analytics } from "./analytics";

analytics.track("button_clicked", {
  button_name: "checkout",
});
```

For additional features and configuration options, see [`packages/browser-sdk/README.md`](packages/browser-sdk/README.md).

## 8. Event Ingestion

The event-ingestion endpoint is:

```http
POST /api/v1/events
Content-Type: application/json
```

Browser requests include the public project key in the event payload. Server requests also include the server key in the bearer authorization header.

| Integration | Authentication | Event source |
|---|---|---|
| Browser SDK | Public project key | `browser` |
| PHP Server SDK | Public project key and server bearer key | `server` |

The API validates incoming events and associates them with the relevant project. Check [`docs/API.md`](docs/API.md) for the implemented routes, request parameters, response formats, and authentication requirements.

## 9. Run Tests and Build Applications

### Laravel API tests

```bash
cd apps/api
php artisan test
```

To run the analytics tests separately:

```bash
php artisan test --filter=AnalyticsTest
php artisan test --filter=EventIngestionTest
```

### Admin dashboard

```bash
cd apps/admin
npm run build
```

### Restaurant Demo

```bash
cd apps/restaurant-demo
npm run build
```

### Browser SDK

```bash
cd packages/browser-sdk
npm run build
npm test
```

## 10. Troubleshooting

### PostgreSQL connection errors

- Check that the PostgreSQL container is running with `docker compose ps`.
- Verify the port, database name, username, and password in `apps/api/.env`.
- Confirm the database port matches `docker-compose.yml`.

### Laravel configuration issues

After changing environment variables, clear the configuration cache:

```bash
cd apps/api
php artisan config:clear
```

### Browser events are not appearing

- Check that the API is running.
- Verify the Browser SDK endpoint and public project key.
- Inspect browser Developer Tools → Network for `POST /api/v1/events`.
- Check the API response and Laravel logs.

### Server events are rejected

- Verify the public project key and server key.
- Confirm that the server key matches the project's configured credential.
- Check the `Authorization: Bearer ...` header.
- Never put server credentials in frontend configuration.

## Security

- Never commit `.env` files or real credentials.
- Never expose server keys in browser applications.
- Use HTTPS in production.
- Rotate any server key that may have been exposed.
- Avoid sending passwords, payment credentials, or sensitive personal data in analytics events.
- Back up the database and review migrations before production deployment.

## License

See the repository's license file, if present.
