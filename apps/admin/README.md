# PulseTrack Admin Dashboard

The PulseTrack Admin Dashboard is a React application for viewing website analytics collected by the PulseTrack API. It provides the interface for monitoring website activity, visitor metrics, popular pages, event trends, and other available analytics.

## Technology Stack

- React
- TypeScript
- Vite
- ESLint
- PulseTrack Laravel API

## Requirements

- Node.js and npm compatible with the project dependencies
- A running PulseTrack API
- A valid admin account
- A configured API endpoint

## Installation

From the repository root:

```bash
cd apps/admin
npm install
```

## Configuration

Configure the API endpoint using the environment variable or configuration mechanism implemented by the admin application.

For example, if the application uses Vite environment variables, it may use an `.env` file:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

Use the actual variable name expected by the application. Do not assume `VITE_API_URL` is supported until you confirm the configuration in the source code.

Do not place server keys or other secret credentials in frontend environment variables. Vite exposes variables prefixed with `VITE_` to client-side code.

## Development

Start the development server:

```bash
npm run dev
```

Open the URL printed by Vite in your terminal.

The development server supports Hot Module Replacement (HMR), allowing supported changes to appear without manually restarting the application.

## Build for Production

Create a production build:

```bash
npm run build
```

The compiled files are