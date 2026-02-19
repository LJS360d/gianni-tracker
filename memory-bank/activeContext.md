# Active Context — Gianni Tracker

## Current Phase

**Phase 3 complete.** Admin controls, family track endpoint, and last-sync display are in place.

## What Was Just Done

- Phase 3: Admin page at `/admin` (token gate via sessionStorage, delay slider 0–168h, sharing toggle, last-sync from `GET /api/admin/status`)
- `GET /api/admin/config` and `PATCH /api/admin/config` (Bearer ADMIN_ACCESS_TOKEN), `GET /api/admin/status` for last_sync_server_ts
- `GET /api/family/track`: same shape as public track, uses FAMILY_DELAY_HOURS and Bearer FAMILY_ACCESS_TOKEN
- `getLastSyncServerTs()` in db.ts; ADMIN_ACCESS_TOKEN in .env.example
- Nav added to app root; Admin link in nav; i18n keys for admin (en/it)

## What Comes Next

1. **Phase 4**: Offline tile caching, track animation, embeddable webview, TV display optimization

## Active Decisions

- **Database**: Bun SQLite, file path from `DATABASE_PATH` (default `./data/gianni.db`).
- **Deployment target**: Not yet decided. Vercel, Netlify, or Cloudflare Pages are candidates.
- **Map interaction**: Read-only for public view. Pan/zoom only. No user input on map.

## Known Issues

None yet — project just initialized.
