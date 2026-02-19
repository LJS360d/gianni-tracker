# Active Context — Gianni Tracker

## Current Phase

**Project initialization**. Template scaffolded with SolidStart + TailwindCSS. Memory bank and AGENTS.md created. Dependencies being added. No application code written yet.

## What Was Just Done

- Created project from SolidStart `with-tailwindcss` template
- Created `AGENTS.md` with project-level agent guidance
- Created `memory-bank/` with full context documentation
- Added dependencies: leaflet, @solid-primitives/i18n, @solid-primitives/storage, vite-plugin-pwa
- Mockup saved as reference image

## What Comes Next

1. **PWA setup**: Configure `vite-plugin-pwa` in `app.config.ts`, create manifest, add service worker registration
2. **i18n setup**: Create translation dictionaries (it/en), wire up `@solid-primitives/i18n` provider
3. **Map component**: Leaflet map with CartoDB Dark Matter tiles, basic track rendering
4. **Ingest API**: `POST /api/ingest` endpoint accepting batched GPS points
5. **Public track API**: `GET /api/track` with server-side delay enforcement
6. **Database**: Choose and configure storage (SQLite for MVP, or Turso for edge)
7. **Admin controls**: Settings panel for delay/sharing toggle
8. **Device config endpoint**: `GET /api/device/config` returning plain-text config
9. **Family access**: Token-authenticated endpoint with reduced delay

## Active Decisions

- **Database**: Not yet chosen. SQLite (via better-sqlite3 or Drizzle) is the leading candidate for MVP simplicity. Turso for edge deployment later.
- **Deployment target**: Not yet decided. Vercel, Netlify, or Cloudflare Pages are candidates.
- **Map interaction**: Read-only for public view. Pan/zoom only. No user input on map.

## Known Issues

None yet — project just initialized.
