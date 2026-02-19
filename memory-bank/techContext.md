# Tech Context — Gianni Tracker

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | SolidStart | ^1.1.0 |
| UI Library | SolidJS | ^1.9.5 |
| Router | @solidjs/router | ^0.15.0 |
| Build | Vinxi | ^0.5.7 |
| Styling | TailwindCSS | v4 (Vite plugin) |
| Map | Leaflet | latest |
| Map Tiles | CartoDB Dark Matter | `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` |
| i18n | @solid-primitives/i18n | latest |
| PWA | vite-plugin-pwa | latest |
| Runtime | Bun | >=1.3.9 |
| Node compat | Node | >=24 |

## Dependencies

### Production
- `solid-js`, `@solidjs/start`, `@solidjs/router`, `vinxi` — framework core
- `leaflet` — map rendering
- `@solid-primitives/i18n` — internationalization
- `@solid-primitives/storage` — persistent reactive storage (for settings/cache)

### Development
- `tailwindcss`, `@tailwindcss/vite` — styling
- `@types/leaflet` — TypeScript types for Leaflet
- `vite-plugin-pwa` — PWA generation (service worker, manifest, icons)

## Configuration Files

| File | Purpose |
|------|---------|
| `app.config.ts` | SolidStart/Vinxi config (Vite plugins registered here) |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies, scripts, engine constraints |
| `.env` | Environment variables (not committed) |
| `.env.example` | Template for required env vars |

## Environment Variables (Planned)

```
DATABASE_URL=           # Database connection string
DEVICE_AUTH_TOKEN=      # Token the GPS device uses to authenticate ingestion
FAMILY_ACCESS_TOKEN=    # Token for family access endpoint
PUBLIC_DELAY_HOURS=48   # Default delay for public map (hours)
FAMILY_DELAY_HOURS=6    # Reduced delay for family access (hours)
```

## PWA Configuration

- Service worker strategy: NetworkFirst for API, CacheFirst for tiles and static assets
- Manifest: dark theme, standalone display mode
- Precache: app shell, critical CSS, base map tiles for last known region

## Map Tile Provider

CartoDB Dark Matter (no API key required):
```
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```
Attribution: `&copy; OpenStreetMap contributors &copy; CARTO`

## Development Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server
bun run build        # Production build
bun run start        # Start production server
```
