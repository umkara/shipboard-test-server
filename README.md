# Shipboard test server

A tiny HTTP server (Node, no dependencies) used to test the Shipboard iOS app against
Fly.io and Render. It writes JSON log lines and has routes that create things worth watching:

| Route | What it does |
|---|---|
| `/` | Status text with uptime and request count |
| `/healthz` | `ok` (health check, not logged) |
| `/error` | Returns 500 and logs an error |
| `/slow` | Answers after 2 seconds |
| `/burst` | Writes 11 log lines (info, warn, error) |

## Run locally

```bash
node server.js
```

## Deploy

- **Fly.io:** create an app from this repo in the dashboard, or `fly launch` (uses `fly.toml`:
  shared-cpu-1x, 256 MB, stops when idle).
- **Render:** New Web Service from this repo, start command `node server.js`, Free plan.

MIT licence.
