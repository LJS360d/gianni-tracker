# AGENTS.md — Gianni Tracker

## Project Overview

GPS tracker web app for a traveler ("Gianni") who shares his position with followers via a public map page. Built with SolidStart + TailwindCSS. The device operates on 2G with sporadic connectivity — data arrives in bursts, not streams.

## Architecture

- **Framework**: SolidStart (SSR + SPA, file-based routing via Vinxi)
- **Styling**: TailwindCSS v4 (Vite plugin)
- **Map**: Leaflet with CartoDB Dark Matter tiles
- **i18n**: `@solid-primitives/i18n`
- **PWA**: `vite-plugin-pwa`
- **Runtime**: Bun

## Core Concepts

### Public Delay

The public map NEVER shows real-time position. A configurable delay (default 48–72h) is enforced server-side. Gianni can also toggle sharing OFF entirely. This is a hard security constraint, not a preference.

### Dual Timestamps

Every GPS point has two timestamps:
- `device_ts`: when the device recorded the position
- `server_ts`: when the server received it

The public page uses `device_ts` for display but filters by `device_ts + delay < now`.

### Burst Ingestion

The device buffers points and sends them all at once when it finds a radio bridge. The ingest endpoint must accept arrays of points in a single request and handle out-of-order arrival gracefully.

### Device Pull Configuration

The device periodically fetches a plain-text config file from the server. Changes (e.g., toggling tracking off) take effect only at next device check-in.

## Key Directories

```
src/
  routes/          # File-based routing (SolidStart)
  components/      # UI components
  lib/             # Business logic, API clients, utilities
  i18n/            # Translation dictionaries
  server/          # Server-side API routes and logic
memory-bank/       # Project context for AI agents
```

## Development Rules

- Use `bun` as package manager and runtime
- Environment variables for all secrets (see `.env.example`)
- No inline API keys or tokens in source code
- Minimal comments — self-explanatory code only
- No documentation files created without explicit request
- Italian is the primary language for UI copy; English is the default fallback
- All public endpoints enforce the delay filter server-side

## Memory Bank

This project uses the `memory-bank/` pattern for persistent AI context. Before starting work, read `memory-bank/activeContext.md` and `memory-bank/progress.md` for current state. Update them after significant changes.

## Testing

Tests are adapted to validate behavior, not implementation details. Non-deterministic outputs (e.g., array ordering) are tested with order-independent assertions.
