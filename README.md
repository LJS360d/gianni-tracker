# Gianni Tracker

Web app that shows a delayed GPS track on a map so people can follow a traveler’s route without seeing real-time position. Built for 2G devices that send position in bursts.

## What it does

- **Public map**: One page with a dark map and the track, always delayed (e.g. 48–72h). No live position.
- **Gianni**: Can turn sharing on/off and set the delay; changes apply when the device next syncs.
- **Family**: Token-protected access to a closer (but still delayed) position.
- **Device**: Sends batched GPS points when it has connectivity; pulls a simple config file from the server.

## Tech stack

- [SolidStart](https://start.solidjs.com) (SolidJS + Vinxi), TailwindCSS v4, Leaflet (CartoDB Dark Matter), PWA, i18n (it/en).
- Runtime: **Bun** (Node ≥24 supported).

## Setup

```bash
bun install
```

Copy `.env.example` to `.env` and set the variables (see below). For local UI-only work you can run without a database.

## Develop

```bash
bun run dev
```

Open the URL shown in the terminal (e.g. `http://localhost:3000`).

## Build and run

```bash
bun run build
bun run start
```

## Scripts

| Script   | Command         | Description        |
|----------|-----------------|--------------------|
| `dev`    | `vinxi dev`     | Dev server         |
| `build`  | `vinxi build`   | Production build   |
| `start`  | `vinxi start`   | Run production app |

## Environment

Create `.env` from `.env.example`. Required for full functionality:

- `DATABASE_PATH` — path to SQLite file (default `./data/gianni.db`).
- `DEVICE_AUTH_TOKEN` — device auth for ingest API.
- `FAMILY_ACCESS_TOKEN` — token for family position endpoint.
- `PUBLIC_DELAY_HOURS` — default public delay (e.g. 48).
- `FAMILY_DELAY_HOURS` — family view delay (e.g. 6).

## Project layout

- `src/routes/` — file-based pages (e.g. index = public map).
- `src/components/` — reusable UI (e.g. map, nav).
- `src/lib/` — shared logic and API helpers.
- `src/i18n/` — translation dictionaries (it, en).
- `memory-bank/` — context and progress notes for development (and AI agents).
- `AGENTS.md` — high-level guidance for contributors and tooling.

## License

Private / unlicensed unless stated otherwise.
