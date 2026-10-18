# PulseTrack API

The PulseTrack API is the Laravel backend for the PulseTrack analytics platform. It accepts browser and server-side analytics events, stores them in PostgreSQL, and provides analytics endpoints for the admin dashboard.

## Features

- Browser and server-side event ingestion
- Project-based analytics data isolation
- Server-key authentication for server-side events
- Analytics summaries, visitor metrics, and session metrics
- Popular pages and event trends
- Restaurant demo integration and order-event tracking
- Laravel-based API and database migrations

Available endpoints and behavior depend on the routes and controllers implemented in this repository.

## Technology Stack

- PHP and Laravel
- Eloquent ORM
- PostgreSQL
- Composer
- PulseTrack Browser SDK
- PulseTrack PHP Server SDK

## Requirements

- PHP 8.2 or later, with the extensions required by Laravel
- Composer
- Node.js and npm if working with the frontend applications
- Docker Desktop
- PostgreSQL through Docker Compose

## Project Structure

```text
apps/api/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   ├── Models/
│   └── Providers/
├── bootstrap/
├── config/
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
├── tests/
│   └── Feature/
├── composer.json
├── artisan
└── .env.example
```

This is a representative structure; individual files may vary as the project evolves.

## Start PostgreSQL

From the repository root:

```bash
docker compose up -d postgres
docker compose ps
```

The local PostgreSQL configuration uses host port `5433`. Check `docker-compose.yml` and configure the API database connection to match it.

## Install Dependencies

From the API directory:

```bash
cd apps/api
composer install
```

If the PHP Server SDK is configured as a local Composer path dependency, ensure the repository configuration in `composer.json` points to `../../packages/server-sdk`.

## Configure Environment Variables

Create the environment file if one does not already exist:

```bash
cp .env.example .env
```

Configure the database connection and PulseTrack settings in `apps/api/.env`.

Example database configuration:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5433
DB_DATABASE=pulsetrack
DB_USERNAME=YOUR_DATABASE_USERNAME
DB_PASSWORD=YOUR_DATABASE_PASSWORD
```

Configure PulseTrack server SDK settings as required by `config/pulsetrack.php`:

```dotenv
PULSETRACK_ENDPOINT=http://127.0.0.1:8000
PULSETRACK_PUBLIC_KEY=YOUR_PROJECT_PUBLIC_KEY
PULSETRACK_SERVER_KEY=YOUR_PROJECT_SERVER_KEY
PULSETRACK_TIMEOUT=5
```

Use the exact environment variable names expected by the application and SDK configuration. Never commit real credentials or server keys to source control.

Generate the Laravel application key if needed:

```bash
php artisan key:generate
```

## Run Database Migrations

Run the migrations:

```bash
php artisan migrate
```

If you intend to seed the database, inspect the seeders first:

```bash
php artisan db:seed
```

Avoid using destructive database reset commands on a database containing data you need to preserve.

## Start the API

Run the Laravel development server:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

The local API base URL is:

```text
http://127.0.0.1:8000
```

The standalone Restaurant Demo can use this API endpoint for local development.

## Event Ingestion

The primary event-ingestion endpoint is:

```http
POST /api/v1/events
Content-Type: application/json
```

A browser event includes the public project key and event metadata:

```json
{
  "public_key": "YOUR_PROJECT_PUBLIC_KEY",
  "event_id": "123e4567-e89b-42d3-a456-426614174000",
  "event_name": "page_view",
  "anonymous_id": "visitor-example",
  "session_id": "session-example",
  "user_id": null,
  "timestamp": "2026-10-18T12:00:00Z",
  "properties": {
    "page_path": "/"
  }
}
```

Use a valid UUID for `event_id` and a valid timestamp. The API validates incoming payloads and associates accepted events with the project identified by `public_key`.

### Browser events

Browser events use the public project key without the server bearer key. Accepted events are recorded with `source = browser`.

### Server events

Server events use the public project key in the request payload and the server key in the bearer authorization header:

```http
Authorization: Bearer YOUR_PROJECT_SERVER_KEY
```

The API validates the server key against the project's configured credential. Accepted server events are recorded with `source = server`.

Never expose the server key to browser code.

## Analytics Endpoints

The analytics API includes endpoints for summary metrics, popular pages, and event trends.

Examples of documented routes include:

```text
GET /api/v1/analytics/summary
GET /api/v1/analytics/popular-pages
GET /api/v1/analytics/event-trends
```

Analytics requests use the admin authentication mechanism implemented by the API and identify the project through its public key.

Consult `routes/` and `docs/API.md` for the exact request parameters, response structures, middleware, and authorization requirements.

## PHP Server SDK Integration

The PHP Server SDK is located at:

```text
packages/server-sdk/
```

It can be injected into Laravel controllers or services to track business events:

```php
use PulseTrack\ServerSdk\PulseTrack;

public function __construct(
    private PulseTrack $pulsetrack,
) {}
```

Example:

```php
$this->pulsetrack->track('order_created', [
    'order_id' => (string) $order->id,
    'total_amount' => (float) $order->total_amount,
    'currency' => $order->currency,
]);
```

Send business events after the relevant operation has succeeded. Handle analytics failures separately when they should not interrupt a successful order.

See [PHP Server SDK documentation](../../packages/server-sdk/README.md).

## Browser SDK Integration

The Browser SDK is located at:

```text
packages/browser-sdk/
```

It sends page views and custom events from browser-based applications. The frontend must use the public project key only.

See [Browser SDK documentation](../../packages/browser-sdk/README.md).

## Testing

Run the event-ingestion tests:

```bash
php artisan test --filter=EventIngestionTest
```

Run the analytics tests:

```bash
php artisan test --filter=AnalyticsTest
```

Run the complete API test suite:

```bash
php artisan test
```

The event-ingestion tests cover browser events, server-key authentication, invalid credentials, payload validation, and duplicate-event handling. The analytics tests cover summary metrics, date filters, project isolation, popular pages, event trends, and administrative authorization.

## Security

- Keep `.env` files and server credentials out of version control.
- Never expose server keys in frontend code.
- Use HTTPS in production.
- Protect administrative analytics endpoints with authentication and authorization.
- Validate all incoming event payloads.
- Avoid collecting sensitive customer, authentication, or payment information.
- Rotate credentials that may have been exposed.
- Review database migrations and backups before deployment.

## Related Documentation

- [Main PulseTrack README](../../README.md)
- [Browser SDK](../../packages/browser-sdk/README.md)
- [PHP Server SDK](../../packages/server-sdk/README.md)
- [API Reference](../../docs/API.md)
