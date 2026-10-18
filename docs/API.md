# PulseTrack API Reference

This document describes the event ingestion and analytics endpoints implemented in the PulseTrack API.

## Base URL

Local development:

```text
http://127.0.0.1:8000
```

Production deployments should use their configured HTTPS API URL.

## 1. Ingest an event

`POST /api/v1/events`

Accepts browser and server-side analytics events.

### Headers

```http
Content-Type: application/json
Accept: application/json
```

Server-side requests may additionally send:

```http
Authorization: Bearer YOUR_SERVER_KEY
```

### Request body

```json
{
  "public_key": "YOUR_PROJECT_PUBLIC_KEY",
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_name": "order_created",
  "anonymous_id": "visitor-123",
  "session_id": "session-456",
  "user_id": "user-789",
  "timestamp": "2026-10-18T10:30:00Z",
  "properties": {
    "order_id": 123,
    "total_amount": 99,
    "currency": "INR"
  }
}
```

`user_id` is optional and may be `null`. `properties` is optional.

### Validation rules

| Field | Rule |
|---|---|
| `public_key` | Required string, maximum 100 characters |
| `event_id` | Required UUID |
| `event_name` | Required string, maximum 100 characters; begins with a letter and contains only letters, numbers, and underscores |
| `anonymous_id` | Required string, maximum 100 characters |
| `session_id` | Required string, maximum 100 characters |
| `user_id` | Optional nullable string, maximum 255 characters |
| `timestamp` | Required date |
| `properties` | Optional array with at most 50 top-level entries |

### Success response

HTTP `202 Accepted`:

```json
{
  "message": "Event accepted",
  "event_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Errors

| HTTP status | Meaning |
|---|---|
| `401` | Invalid project key |
| `401` | Invalid server key |
| `422` | Invalid event payload |

Validation errors return a JSON response containing `message` and an `errors` object.

### Browser and server authentication

- Browser requests provide the project public key in the request body.
- Server requests provide the same project key plus a bearer server key.
- When a valid bearer key is supplied, the event source is recorded as `server`.
- Requests without a bearer key are recorded as `browser`.
- Event IDs are unique per project. Repeated submissions with the same event ID do not create another event record.

**Security:** Never expose a server key in frontend code, HTML, or public repositories.

## 2. Analytics endpoints

These endpoints require the API's admin authentication mechanism and an active admin account. The project must belong to the authenticated admin.

Pass the project key as a query parameter:

```text
?public_key=YOUR_PROJECT_PUBLIC_KEY
```

Optional date filters:

```text
&from=2026-10-01&to=2026-10-18
```

The `from` and `to` values must be valid dates. `to` must be on or after `from`. Date filtering includes the full `to` calendar day.

### Summary

`GET /api/v1/analytics/summary`

Example:

```text
GET /api/v1/analytics/summary?public_key=YOUR_PROJECT_PUBLIC_KEY&from=2026-10-01&to=2026-10-18
```

Response fields:

```json
{
  "total_events": 100,
  "page_views": 60,
  "unique_visitors": 25,
  "unique_sessions": 35,
  "orders_created": 4,
  "order_value": 946.00
}
```

The numbers above are illustrative, not live data.

`orders_created` and `order_value` are derived from `order_created` events with an `order_id` property. Order value counts at most one amount per distinct order ID in the filtered event set.

### Popular pages

`GET /api/v1/analytics/popular-pages`

Returns up to 10 page paths, ordered by view count.

Example response:

```json
{
  "pages": [
    {
      "path": "/",
      "views": 42
    },
    {
      "path": "/menu",
      "views": 18
    }
  ]
}
```

The API uses the `page_path` property, falls back to `path`, and then `/`.

### Event trends

`GET /api/v1/analytics/event-trends`

Returns event counts grouped by date and event name.

Example response:

```json
{
  "trends": [
    {
      "date": "2026-10-18",
      "event_name": "page_view",
      "total": 60
    },
    {
      "date": "2026-10-18",
      "event_name": "order_created",
      "total": 4
    }
  ]
}
```

### Analytics errors

| HTTP status | Meaning |
|---|---|
| `401` | Missing or unauthorized admin/project |
| `422` | Invalid date range |

The exact admin authentication mechanism should be taken from the current auth controller and middleware configuration.

## 3. Other available API routes

The following routes also exist in the current Laravel application. Their complete request and response contracts should be documented from their respective controllers before being treated as stable public APIs.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/admin/login` | Admin login |
| `POST` | `/api/v1/admin/logout` | Admin logout |
| `GET` | `/api/v1/admin/me` | Current admin |
| `GET` | `/api/v1/admin/projects` | List admin projects |
| `POST` | `/api/v1/admin/projects` | Create project |
| `POST` | `/api/v1/admin/register` | Admin registration |
| `POST` | `/api/v1/auth/request-otp` | Request OTP |
| `POST` | `/api/v1/auth/verify-otp` | Verify OTP |
| `POST` | `/api/v1/auth/logout` | Customer logout |
| `GET` | `/api/v1/auth/me` | Current customer |
| `GET` | `/api/v1/orders` | List customer orders |
| `POST` | `/api/v1/orders` | Create order |
| `GET` | `/api/v1/orders/{orderId}` | Retrieve order |
| `GET` | `/api/v1/orders/{orderId}/tracking` | Order tracking |
| `GET` | `/api/v1/products` | List products |

## 4. Verify routes

From `apps/api`:

```bash
php artisan route:list --path=api/v1
```

Use the current controllers and route middleware as the source of truth when updating this document.
