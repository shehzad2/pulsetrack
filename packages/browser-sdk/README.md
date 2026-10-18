# PulseTrack Browser SDK

The PulseTrack Browser SDK sends analytics events from browser-based applications to the PulseTrack API.

## Requirements

- A running PulseTrack API.
- A valid PulseTrack project public key.
- A browser environment supporting `fetch`, `crypto.randomUUID`, and browser storage where available.

## Installation

The package is currently configured for internal project use.

From the repository root:

```bash
npm install
npm run build --prefix packages/browser-sdk
```

For a local application using this SDK, configure the package through your workspace or local package setup.

## Initialization

Import `PulseTrack` from the package:

```typescript
import { PulseTrack } from "@pulsetrack/browser-sdk";

const analytics = new PulseTrack({
  endpoint: "http://127.0.0.1:8000",
  projectKey: "YOUR_PULSETTRACK_PUBLIC_KEY",
});
```

Replace the endpoint and public key with your deployment's values.

Page-view tracking is enabled by default.

## Configuration

| Option | Type | Default | Description |
|---|---|---|---|
| `endpoint` | `string` | Required | PulseTrack API base URL |
| `projectKey` | `string` | Required | Public project key |
| `autoTrackPageViews` | `boolean` | `true` | Track the initial page view |
| `autoTrackClicks` | `boolean` | `false` | Track eligible button and link clicks |
| `autoTrackForms` | `boolean` | `false` | Track form submissions without field values |
| `conversionRules` | `ConversionRule[]` | `[]` | Track configured URL-based conversions |

## Track a custom event

```typescript
await analytics.track("add_to_cart", {
  product_id: "burger-001",
  quantity: 2,
  price: 99,
});
```

Event names must start with a letter and contain only letters, numbers, or underscores, with a maximum length of 100 characters.

Event properties support string, number, boolean, and null values.

## Identify a user

Call `identify()` after your application knows the authenticated user's identifier:

```typescript
analytics.identify("user-123");

await analytics.track("menu_view");
```

The identifier is attached to subsequent events from this SDK instance.

To clear the current user identity, call:

```typescript
analytics.resetIdentity();
```

Use a stable, non-sensitive identifier. Do not send passwords, access tokens, payment details, or other sensitive data.

## Page views

Page views are tracked automatically on initialization unless disabled:

```typescript
const analytics = new PulseTrack({
  endpoint: "http://127.0.0.1:8000",
  projectKey: "YOUR_PULSETTRACK_PUBLIC_KEY",
  autoTrackPageViews: true,
});
```

You can also track a page view manually:

```typescript
analytics.page();
```

Page-view properties include the current path and query string, document title, and document referrer.

## Automatic click tracking

Enable click tracking:

```typescript
const analytics = new PulseTrack({
  endpoint: "http://127.0.0.1:8000",
  projectKey: "YOUR_PULSETTRACK_PUBLIC_KEY",
  autoTrackClicks: true,
});
```

The SDK listens for clicks on buttons, links, and elements marked with `data-analytics-event`.

To assign a custom event name:

```html
<button data-analytics-event="checkout_started">
  Checkout
</button>
```

Custom click events include the element tag and current page path. Ordinary click events also include a truncated element text value.

Avoid placing sensitive information in button or link text.

## Automatic form tracking

Enable form submission tracking:

```typescript
const analytics = new PulseTrack({
  endpoint: "http://127.0.0.1:8000",
  projectKey: "YOUR_PULSETTRACK_PUBLIC_KEY",
  autoTrackForms: true,
});
```

The SDK sends a `form_submit` event containing the page path, form ID, and form name. It does not intentionally collect form field values.

## URL-based conversion tracking

Conversion rules match the current path and query string. They are checked during initialization and browser history navigation.

```typescript
const analytics = new PulseTrack({
  endpoint: "http://127.0.0.1:8000",
  projectKey: "YOUR_PULSETTRACK_PUBLIC_KEY",
  conversionRules: [
    {
      eventName: "checkout_completed",
      urlIncludes: "/thank-you/",
    },
  ],
});
```

When the URL matches, the SDK emits the configured event with `page_path` and `detection_method: "url_rule"`.

This is URL-based detection, not proof that a transaction succeeded. For reliable order or payment events, track the confirmed server-side result through the PulseTrack Server SDK.

## Visitor and session identifiers

The SDK creates a visitor identifier and stores it in local storage when possible. Session identifiers use session storage and are renewed after 30 minutes of inactivity.

If browser storage is unavailable, the SDK falls back to generated identifiers.

## Cleanup

When removing the SDK instance, for example when unmounting an application component, call:

```typescript
analytics.destroy();
```

This removes the event listeners and restores history methods if the SDK's wrappers are still installed.

## Event delivery and errors

Events are sent using `POST /api/v1/events` as JSON. Browser events include the project key and generated event metadata.

Non-success HTTP responses and network failures are logged to the browser console. The SDK does not currently expose a delivery queue or automatic retry mechanism.

## Build and tests

From the repository root:

```bash
npm run build --prefix packages/browser-sdk
npm test --prefix packages/browser-sdk
```

The tests cover custom events, page views, user identification, click tracking, form tracking, and URL-based conversion tracking.
