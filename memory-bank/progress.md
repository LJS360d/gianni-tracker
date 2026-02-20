# Progress — Gianni Tracker

## What Works

- [x] Project scaffolded (SolidStart + TailwindCSS template)
- [x] AGENTS.md created
- [x] Memory bank initialized with full project context
- [x] Dependencies declared (leaflet, i18n, PWA, types)
- [x] PWA manifest and service worker (vite-plugin-pwa, client registration)
- [x] i18n provider with it/en dictionaries and locale switcher in Nav
- [x] Leaflet map component with CartoDB dark tiles, client-only (mounted signal), resize handling
- [x] Basic responsive layout: full-height map, dark theme, viewport meta, flex min-h-screen

## What Doesn't Work Yet

- [x] Phase 4: offline tile caching, track animation, embeddable webview, TV optimization

## MVP Milestone Checklist

### Phase 1 — Foundation
- [x] PWA manifest and service worker configuration
- [x] i18n provider with it/en dictionaries
- [x] Leaflet map component with dark tiles
- [x] Basic responsive layout (mobile → TV)

### Phase 2 — Data Layer
- [x] Database schema (points table with dual timestamps, config table)
- [x] Ingest API (POST, batch points, idempotent)
- [x] Public track API (GET, delay-filtered, downsampled)
- [x] Device config API (GET, plain-text response)

### Phase 3 — Controls
- [x] Admin page (delay slider, sharing toggle)
- [x] Family access endpoint (token-auth, reduced delay)
- [x] Last-sync status display

### Phase 4 — Polish
- [x] Offline tile caching strategy
- [x] Track animation / progressive reveal
- [x] Embeddable webview and TV modes via `?mode=embed` and `?mode=tv` on `/` (minimal chrome, no animation; TV adds large zoom/contrast)

---

## Implemented from Backlog

- **Segment types**: `points.segment_type` (ground | plane | boat). Ingest accepts optional `segment_type`; track/family APIs return it; Map draws separate polylines per segment (ground: white, plane: light blue dashed, boat: blue dashed).
- **Media provider**: `media.provider` (youtube | imgur | local). Track/family APIs return `provider`; MediaModal uses `<video>` for local/direct video URLs, iframe for YouTube.
- **Default seed**: `bun run seed` — Lucca → Serbia → Bulgaria → Turkey → Georgia → (plane) Turkmenistan → Uzbekistan → Mongolia (Ulan Bator) → China → (boat) Seoul → east coast Korea → (boat) Japan → Tokyo; 471 points, 105 media (mix image/video, youtube/imgur/local). Delay set to 168h for visibility.

## Planned / Backlog

- Serve local media files (e.g. `/media/*`) so seed local URLs work; optional storage/upload for admin.
- Further route/media tweaks as needed.
