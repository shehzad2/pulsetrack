# PulseTrack Browser SDK

The PulseTrack Browser SDK collects website analytics events and sends them to the PulseTrack API. It supports page-view tracking, custom events, user identification, optional click and form tracking, and URL-based conversion tracking.

## Features

- Automatic initial page-view tracking
- Custom event tracking
- Optional automatic click tracking
- Optional form submission tracking without collecting field values
- User identification and identity reset
- URL-based conversion tracking
- Visitor and session identifiers
- Cleanup of registered event listeners

## Requirements

- A running PulseTrack API
- A valid PulseTrack project public key
- A supported browser environment with `fetch`
- Support for `crypto.randomUUID` and browser storage, where available

The SDK uses browser storage when possible and falls back to generated identifiers when storage is unavailable.

## Installation

The package is currently configured for internal project use.

From the repository root, build the SDK:

```bash
npm install --prefix packages/browser-sdk
npm run build --prefix packages/browser-sdk
```

### Install in a local application

For the Restaurant Demo, install the local package from the repository root:

```bash
cd apps/restaurant-demo
npm install ../../packages/browser-sdk
```

If the application already uses an npm workspace or another local package configuration, retain that configuration and install dependencies using the corresponding workspace setup.

After changing the SDK source, rebuild the package before testing the application.

## Initialization

Import `PulseTrack` and initialize it with your API endpoint and project public key:

```typescript
import { PulseTrack } from "@pulsetrack/browser-sdk";

const analytics = new PulseTrack({
  endpoint: "http://127.0.0.1:8000",
  projectKey: "YOUR_PULSETRACK_PUBLIC_KEY",
});
```

Replace the endpoint and public key with the values for your deployment.

Page-view tracking is enabled by default. The browser SDK uses the public project key; **never put the server key in browser code**.

## Configuration

| Option | Type | Default | Description |
|---|---|---|---|
| `endpoint` | `string` | Required | PulseTrack API base URL |
| `projectKey` | `string` | Required | Public project key |
| `autoTrackPageViews` | `boolean` | `true` | Track the initial page view |
| `autoTrack