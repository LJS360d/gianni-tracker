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
- [x] Embeddable webview mode (minimal chrome)
- [x] TV display optimization (large fonts, high contrast)

---

## Planned / Backlog

### Rich seed: Lucca → Tokyo route

- **Route**: Many more points simulating a journey from Lucca (Italy) → Tokyo (Japan).
- **Overland segments**: Lucca → Serbia → Bulgaria → Turkey → Georgia (regular polyline).
- **Plane segment**: Special polyline type for flight Georgia → Turkmenistan.
- **Overland**: Turkmenistan → China, passing through Mongolia (Ulan Bator included), then down through China.
- **Boat segment**: Special polyline for boat travel to Seoul.
- **Overland**: Regular polyline along east coast of South Korea.
- **Boat segment**: Special polyline boat to Japan, then to Tokyo.
- **Media**: At least 100 photo/video entries along the route (mix of points); sources not limited to YouTube/Imgur.

### Segment types (polylines)

- **Regular**: default ground travel (current single polyline).
- **Plane**: distinct styling/type for flight segments (e.g. Georgia → Turkmenistan).
- **Boat**: distinct styling/type for boat segments (e.g. to Seoul, to Japan).
- Schema/API and map rendering to support segment type (or multiple polylines with type metadata).

### Media: local / embedded video

- Support media entries that are **local** (or self-hosted) videos, not only YouTube or Imgur.
- Playback via an actual embedded player (e.g. `<video>` with source URL), not only iframe embeds for external platforms.
- Plan covers: data model (e.g. `type: "video"` + source or `provider: "local"`), storage/URLs for local files, and UI (MediaModal or equivalent) rendering local video in an embedded player.
