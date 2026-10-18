# PulseTrack

PulseTrack is an analytics platform for collecting browser and server-side events and viewing website activity, visitor metrics, popular pages, event trends, and order analytics.

## Project architecture

```text
pulsetrack/
├── apps/
│   ├── api/                 Laravel API and restaurant demo
│   ├── admin/               React analytics dashboard
│   └── restaurant-demo/     React demo application
├── packages/
│   ├── browser-sdk/         TypeScript browser analytics SDK
│   ├── server-sdk/          PHP/Laravel server analytics SDK
│   └── server-sdk-node-backup/
├── docs/
│   └── API.md               API reference
├── docker-compose.yml       Local PostgreSQL service
└── README.md
```

The `server-sdk-node-backup` directory contains an older SDK backup and is not the primary PHP server SDK.

## Technology stack

- **Backend:** PHP, Laravel, Eloquent ORM
- **Database:** PostgreSQL
- **Admin dashboard:** React, TypeScript, Vite
- **Browser SDK:** TypeScript
- **Server SDK:** PHP and Laravel HTTP client
- **Local database:** Docker Compose

## Requirements

Install the tools required by the applications you intend to run:

- PHP 8.2 or later, with the extensions required by Laravel
- Composer
- Node.js and npm compatible with the frontend packages
- Docker Desktop
- PostgreSQL, provided locally through Docker Compose

## Start the database

From the repository root:

```bash
docker compose up -d postgres
```

Check the service:

```bash
docker compose ps
```

The local PostgreSQL configuration uses host port `5433`. Configure `apps/api/.env` to match the database settings in `docker-compose.yml`.

## Configure the Laravel API

```bash
cd apps/api
cp .env.example .env
```

Edit `.env` and configure the application key, PostgreSQL connection, and PulseTrack settings. The exact environment variables depend on your local configuration.

Generate the Laravel application key if needed:

```bash
php artisan key:generate
```

Run migrations:

```bash
php artisan migrate
```

If the project uses seed data, review its seeders before running:

```bash
php artisan db:seed
```

Start the API and Laravel-hosted restaurant demo:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

The local API base URL is `http://127.0.0.1:8000`.

Do not overwrite an existing `.env` file blindly. Back up existing configuration before making changes.

## Run the admin dashboard

Open another terminal:

```bash
cd apps/admin
npm install
npm run dev
```

Use the URL printed by Vite. Configure the dashboard's API URL using the environment variable or configuration mechanism implemented by the admin application.

## Run the standalone restaurant demo

Open another terminal:

```bash
cd apps/restaurant-demo
npm install
npm run dev
```

Use the URL printed by Vite. Configure the SDK endpoint and public project key as required by the demo.

## Browser SDK

The browser SDK is located at `packages/browser-sdk`.

It supports:

- Automatic initial page-view tracking
- Custom event tracking
- Optional click tracking
- Optional form submission tracking
- User identification and identity reset
- URL-based conversion tracking
- Visitor and session identifiers

Read the [Browser SDK guide](packages/browser-sdk/README.md).

## PHP Server SDK

The Laravel-compatible server SDK is located at `packages/server-sdk`.

It supports server-side event delivery using the project public key and server bearer authentication. Use server-side tracking for confirmed business events such as `order_created`.

Read the [PHP Server SDK guide](packages/server-sdk/README.md).

## API reference

See [docs/API.md](docs/API.md) for the documented event ingestion and analytics endpoints.

The API includes event ingestion, analytics summary, popular pages, event trends, authentication, projects, products, and order-related routes. Consult the current route definitions and controllers for endpoint details.

## Build and test the Browser SDK

From the repository root:

```bash
npm run build --prefix packages/browser-sdk
npm test --prefix packages/browser-sdk
```

Build the admin dashboard:

```bash
cd apps/admin
npm run build
```

Build the standalone restaurant demo:

```bash
cd apps/restaurant-demo
npm run build
```

## Security

- Never commit `.env` files or real server credentials.
- Never expose a server key in browser JavaScript or frontend environment variables.
- Use HTTPS in production.
- Rotate any server key that may have been exposed.
- Review authentication and authorization before exposing admin or order endpoints publicly.
- Avoid sending passwords, payment details, or other sensitive information as analytics properties.

## Current documentation

| Document | Purpose |
|---|---|
| [Browser SDK](packages/browser-sdk/README.md) | Browser integration and tracking |
| [PHP Server SDK](packages/server-sdk/README.md) | Laravel server integration |
| [API Reference](docs/API.md) | Event ingestion and analytics endpoints |

## Development status

This repository contains the API, admin dashboard, restaurant demos, and analytics SDKs. Run the documented build and test commands before considering a release production-ready. Verify environment configuration, authentication, error handling, and database migrations in the target deployment.
