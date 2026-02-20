# Active Context — Gianni Tracker

## Current Phase

**Phase 4 complete.** Offline tile caching, track animation, embed view, and TV optimization are in place.

## What Was Just Done

- Phase 4: Workbox runtime caching for CartoDB tiles (CacheFirst, 400 entries, 30-day expiry)
- Map: progressive track reveal over 4s (optional via `animateTrack` prop; disabled when `?mode=embed` or `?mode=tv`)
- Single map route `/`: modes via `?mode=embed` (minimal chrome, no animation, Italy-focused view) or `?mode=tv` (same + .tv-display: large zoom controls, high-contrast loading). Default mode = full chrome, animated track, wide view.
- app.tsx: settings chrome hidden when pathname is `/` and `mode` is `embed` or `tv`

## What Comes Next

1. Deploy / production hardening as needed
2. **Planned (see progress.md “Planned / Backlog”)**: Rich Lucca→Tokyo seed (many points; Serbia, Bulgaria, Turkey, Georgia → plane → Turkmenistan → China/Mongolia/Ulan Bator → boat → Seoul → Korea east coast → boat → Japan); special polyline types for plane/boat; ≥100 photo/video entries; media support for local/embedded video (actual `<video>` player), not only YouTube/Imgur

## Active Decisions

- **Database**: Bun SQLite, file path from `DATABASE_PATH` (default `./data/gianni.db`).
- **Deployment target**: Not yet decided. Vercel, Netlify, or Cloudflare Pages are candidates.
- **Map interaction**: Read-only for public view. Pan/zoom only. No user input on map.

## Known Issues

None yet — project just initialized.
