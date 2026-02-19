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

- [ ] No admin panel
- [ ] No family access endpoint

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
- [ ] Admin page (delay slider, sharing toggle)
- [ ] Family access endpoint (token-auth, reduced delay)
- [ ] Last-sync status display

### Phase 4 — Polish
- [ ] Offline tile caching strategy
- [ ] Track animation / progressive reveal
- [ ] Embeddable webview mode (minimal chrome)
- [ ] TV display optimization (large fonts, high contrast)
