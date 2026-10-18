# PulseTrack

PulseTrack is a lightweight analytics platform for tracking website activity and server-side business events. The monorepo contains a Laravel API, React admin dashboard, Browser SDK, PHP Server SDK, and Restaurant Demo application.

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
└── README.md
```

## Technology Stack

- **Backend:** PHP, Laravel
- **Database:** PostgreSQL
- **Admin dashboard:** React, TypeScript, Vite
- **Browser SDK:** TypeScript
- **Server SDK:** PHP and Laravel HTTP client

## Requirements

Install the following before starting:

- Git
- PHP 8.2 or later and required Laravel extensions
- Composer
- Node.js and npm
- PostgreSQL

## 1. Clone the Repository

```bash
git clone https://github.com/shehzad2/pulsetrack.git
cd pulsetrack
```

## 2: Run PostgreSQL with Docker Compose

Create a `compose.yaml` file in the repository root:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: pulsetrack-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: pulsetrack
      POSTGRES_USER: pulsetrack
      POSTGRES_PASSWORD: pulsetrack@123
    ports:
      - "5433:5432"
    volumes:
      - pulsetrack_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pulsetrack -d pulsetrack"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  pulsetrack_pgdata:
```

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Check the container status:

```bash
docker compose ps
docker compose logs postgres
```

Configure `apps/api/.env` to connect to the Docker PostgreSQL instance:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5433
DB_DATABASE=pulsetrack
DB_USERNAME=pulsetrack
DB_PASSWORD=pulsetrack@123
```

Wait until PostgreSQL is healthy before running Laravel migrations.

**Note:** The Docker port mapping `5433:5432` means PostgreSQL listens on port `5432` inside the container and is accessible on port `5433` from your host machine. If you use a locally installed PostgreSQL server instead, configure the appropriate port and credentials for that installation.


## 3. Install and Configure the Laravel API

Navigate to the API directory:

```bash
cd apps/api
cp .env.example .env
```

If `.env` already exists, do not overwrite your existing configuration. Update it manually instead.

Install PHP dependencies:

```bash
composer install
```

Generate the Laravel application key:

```bash
php artisan key:generate
```

Configure the PulseTrack project credentials in `apps/api/.env`:

```dotenv
PULSETRACK_PUBLIC_KEY=YOUR_PROJECT_PUBLIC_KEY
PULSETRACK_SERVER_KEY=YOUR_PROJECT_SERVER_KEY
PULSETRACK_ADMIN_EMAIL=your-admin@example.com
```

Use the appropriate credentials for your project. The server key must remain private.

Run database migrations and seed the database:

```bash
php artisan migrate
php artisan db:seed
```

Start the Laravel API:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

The API base URL is:

```text
http://127.0.0.1:8000
```

Keep this terminal running.

## 4. Start the Admin Dashboard

Open a new terminal from the repository root:

```bash
cd ~/Documents/pulsetrack/apps/admin
npm install
npm run dev
```

Open the local URL printed by Vite.

Configure the admin API URL using the environment variable expected by `apps/admin/src/api.ts`. Check the source code before adding a new variable.

## 5. Configure the PHP Server SDK

The PHP Server SDK is located at:

```text
packages/server-sdk/
```

It enables Laravel applications to send server-side analytics events to PulseTrack.

### 5.1 Configure the local Composer package

In `apps/api/composer.json`, ensure the local SDK path repository is included in the existing `repositories` array:

```json
{
  "type": "path",
  "url": "../../packages/server-sdk",
  "options": {
    "symlink": true
  }
}
```

Merge this entry with any existing repository configuration.

If the SDK is not already installed, run the following from `apps/api`:

```bash
composer require "pulsetrack/server-sdk:*@dev"
```

If the dependency is already declared in `composer.json` and `composer.lock`, use:

```bash
composer install
```

### 5.2 Configure the SDK

Add these settings to `apps/api/.env` if they are not already present:

```dotenv
PULSETRACK_ENDPOINT=http://127.0.0.1:8000
PULSETRACK_PUBLIC_KEY=YOUR_PROJECT_PUBLIC_KEY
PULSETRACK_SERVER_KEY=YOUR_PROJECT_SERVER_KEY
PULSETRACK_TIMEOUT=5
```

Ensure `config/pulsetrack.php` maps the variables to the configuration keys expected by the SDK:

- `endpoint`
- `public_key`
- `server_key`
- `timeout`

Clear the Laravel configuration cache after changing environment settings:

```bash
cd ~/Documents/pulsetrack/apps/api
php artisan config:clear
```

### 5.3 Register the service provider

The SDK service provider is:

```php
PulseTrack\ServerSdk\PulseTrackServiceProvider
```

Ensure Laravel registers the provider through Composer package auto-discovery or `apps/api/bootstrap/providers.php`, according to the package configuration.

### 5.4 Track a server-side event

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

This is an illustrative example. In the actual checkout flow, send the event after the order has been successfully persisted and use real order data.

The API validates the server key and records accepted server-side events with `source = server`.

See [PHP Server SDK documentation](packages/server-sdk/README.md).

## 6. Configure the Browser SDK

**Configure and build the Browser SDK before starting the Restaurant Demo.** The demo imports this package and cannot run correctly until the dependency is available.

The Browser SDK is located at:

```text
packages/browser-sdk/
```

### 6.1 Build and test the SDK

From the repository root:

```bash
cd ~/Documents/pulsetrack/packages/browser-sdk
npm install
npm run build
npm test
```

### 6.2 Install the SDK in the Restaurant Demo

Open a new terminal:

```bash
cd ~/Documents/pulsetrack/apps/restaurant-demo
npm install ../../packages/browser-sdk
```

If the package is already declared as a local dependency in `apps/restaurant-demo/package.json`, use `npm install` instead.

Confirm that the SDK package name in `packages/browser-sdk/package.json` matches the import used by the demo, such as `@pulsetrack/browser-sdk`.

### 6.3 Configure the public project key

Configure `apps/restaurant-demo/src/config.ts` with the public key for the Restaurant Demo project:

```typescript
export const PULSETRACK_CONFIG = {
  endpoint: "http://127.0.0.1:8000",
  projectKey: "YOUR_PROJECT_PUBLIC_KEY",
};
```

Use the actual public key assigned to the Restaurant Demo project. Never expose the server key in frontend code.

### 6.4 Initialize analytics

In `apps/restaurant-demo/src/analytics.ts`:

```typescript
import { PulseTrack } from "@pulsetrack/browser-sdk";
import { PULSETRACK_CONFIG } from "./config";

export const analytics = new PulseTrack({
  endpoint: PULSETRACK_CONFIG.endpoint,
  projectKey: PULSETRACK_CONFIG.projectKey,
  autoTrackPageViews: true,
});
```

### 6.5 Track a custom event

Import the initialized analytics client where needed:

```typescript
import { analytics } from "./analytics";

analytics.track("button_clicked", {
  button_name: "checkout",
});
```

Use meaningful event names and non-sensitive properties. Do not send passwords, payment credentials, or other confidential data to analytics.

See [Browser SDK documentation](packages/browser-sdk/README.md) for additional features and configuration options.

## 7. Start the Restaurant Demo

Before starting the demo, ensure that:

- PostgreSQL is running locally.
- Laravel migrations and seeders have completed successfully.
- The Laravel API is running at `http://127.0.0.1:8000`.
- The Browser SDK has been built and installed in the demo.
- The Browser SDK configuration contains the correct public project key.

Open a new terminal:

```bash
cd ~/Documents/pulsetrack/apps/restaurant-demo
npm run dev
```

Open the local URL printed by Vite.

If port `5173` is already in use, Vite may select another port, such as `5174`. Use the URL shown in your terminal.

### Verify browser analytics

1. Open the Restaurant Demo in your browser.
2. Open Developer Tools and select the Network tab.
3. Look for requests to `POST /api/v1/events`.
4. Confirm that the request contains the correct public project key.
5. Check the API response and verify accepted events in the analytics data.

## 8. Event Ingestion and Authentication

The event-ingestion endpoint is:

```http
POST /api/v1/events
Content-Type: application/json
```

Browser requests include the public project key in the event payload. Server requests additionally include the server key in the bearer authorization header:

```http
Authorization: Bearer YOUR_PROJECT_SERVER_KEY
```

| Integration | Authentication | Expected event source |
|---|---|---|
| Browser SDK | Public project key | `browser` |
| PHP Server SDK | Public project key and server bearer key | `server` |

The API validates incoming events and associates them with the relevant project. Requests without a bearer token are treated as browser events by the current ingestion implementation.

See [API documentation](docs/API.md) for the implemented endpoints, parameters, response formats, and authentication requirements.

## 9. Run Tests and Build Applications

### Laravel API tests

```bash
cd ~/Documents/pulsetrack/apps/api
php artisan test
```

Run specific feature tests:

```bash
php artisan test --filter=AnalyticsTest
php artisan test --filter=EventIngestionTest
```

### Admin dashboard

```bash
cd ~/Documents/pulsetrack/apps/admin
npm run build
```

### Restaurant Demo

```bash
cd ~/Documents/pulsetrack/apps/restaurant-demo
npm run build
```

### Browser SDK

```bash
cd ~/Documents/pulsetrack/packages/browser-sdk
npm run build
npm test
```

## 10. Troubleshooting

### PostgreSQL connection errors

- Confirm that PostgreSQL is running locally.
- Verify `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` in `apps/api/.env`.
- For a local PostgreSQL installation using the default port, the port is usually `5432`.
- The database must exist before running migrations.

### Laravel configuration errors

After changing environment variables, clear the configuration cache:

```bash
cd ~/Documents/pulsetrack/apps/api
php artisan config:clear
```

If migrations or seeders fail, check the error message and verify the required environment variables.

### Browser SDK dependency errors

If Vite reports that `@pulsetrack/browser-sdk` cannot be resolved:

```bash
cd ~/Documents/pulsetrack/packages/browser-sdk
npm install
npm run build
```

Then install the local dependency in the Restaurant Demo:

```bash
cd ~/Documents/pulsetrack/apps/restaurant-demo
npm install ../../packages/browser-sdk
npm run dev
```

If the issue persists, verify that the package name in `packages/browser-sdk/package.json` matches the import in `src/analytics.ts`.

### Browser events are not appearing

- Confirm that the API is running.
- Verify the Browser SDK endpoint and public project key.
- Inspect the Network tab for `POST /api/v1/events`.
- Review the API response and Laravel logs.

### Server events are rejected

- Verify the public project key and server key.
- Confirm the server key matches the project's configured credential.
- Check the bearer authorization header.
- Never put server credentials in frontend configuration.

### Vite port is already in use

Vite may select another available port automatically. Open the URL printed in the terminal instead of assuming the application uses port `5173`.

## Security

- Never commit `.env` files or real credentials.
- Never expose server keys in browser applications.
- Use HTTPS for production API communication.
- Rotate any server key that may have been exposed.
- Avoid sending passwords, payment credentials, or sensitive personal data in analytics events.
- Back up the database and review migrations before production deployment.


