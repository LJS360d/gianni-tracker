# Active Context — Gianni Tracker

## Current Phase

**Phase 2 complete.** Data layer in place: Bun SQLite, ingest/track/device-config APIs, map fetches and draws track.

## What Was Just Done

- Phase 2: Database (Bun SQLite, points + config tables), `lib/db.ts`, `lib/geo.ts` (Douglas–Peucker downsampling)
- `POST /api/ingest`: batch points, device_ts + server_ts, optional `Authorization: Bearer` (DEVICE_AUTH_TOKEN)
- `GET /api/track`: delay-filtered, downsampled, returns `{ points, delay_hours }`; empty when sharing off
- `GET /api/device/config`: plain-text key=value for device pull
- Map fetches `/api/track` and draws white polyline, fits bounds when points exist
- `.env.example` with DATABASE_PATH, DEVICE_AUTH_TOKEN, PUBLIC_DELAY_HOURS, FAMILY_*

## What Comes Next

1. **Phase 3**: Admin page (delay slider, sharing toggle), family access endpoint (token, reduced delay), last-sync display

## Active Decisions

- **Database**: Bun SQLite, file path from `DATABASE_PATH` (default `./data/gianni.db`).
- **Deployment target**: Not yet decided. Vercel, Netlify, or Cloudflare Pages are candidates.
- **Map interaction**: Read-only for public view. Pan/zoom only. No user input on map.

## Known Issues

None yet — project just initialized.
