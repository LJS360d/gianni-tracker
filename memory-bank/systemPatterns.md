# System Patterns — Gianni Tracker

## Architecture

```
[GPS Device] ---(2G, sporadic)---> [Ingest API]
                                        |
                                        v
                                   [Database]
                                        |
                        +---------------+---------------+
                        |               |               |
                   [Public API]    [Family API]    [Config API]
                   (delayed)       (token-auth)    (device pull)
                        |               |
                        v               v
                   [Public Map]    [Family View]
```

## Data Flow

### Ingestion
1. Device buffers GPS points locally
2. When connectivity available, device POSTs array of points to ingest endpoint
3. Server stores each point with `device_ts` (from payload) and `server_ts` (server clock)
4. Points may arrive out of order — no assumption of chronological delivery

### Public Display
1. Client requests track data
2. Server filters: `WHERE device_ts < NOW() - delay_hours AND sharing_enabled = true`
3. Server applies downsampling if point density exceeds threshold
4. Client renders track on Leaflet map with dark tiles

### Device Configuration
1. Device periodically GETs `/api/device/config`
2. Server returns plain-text config (key=value format)
3. Config includes: tracking interval, sharing status, any operational flags
4. Changes are eventual-consistency: applied at next device check-in

## Key Patterns

### Server-Side Delay Enforcement
The delay is NEVER a client-side filter. The API itself refuses to return points newer than `NOW() - delay`. This is a security boundary.

### Downsampling Strategy
For public display, apply Douglas-Peucker or time-based thinning to reduce point density. Keep full-resolution data in storage, downsample on read.

### Burst-Safe Ingestion
- Accept `POST /api/ingest` with `{ points: [{ lat, lng, device_ts, ...metadata }] }`
- Validate each point independently
- Return per-point status in response (accepted/rejected/duplicate)
- Idempotency via `device_ts` + coordinates deduplication

### Family Access
- Token-based authentication (simple bearer token or code)
- Returns data with reduced delay (configurable, e.g., 6h instead of 48h)
- Still never returns live position

## Component Structure (Planned)

```
src/
  components/
    Map.tsx              # Leaflet map wrapper
    TrackLine.tsx        # Polyline + position dots
    SettingsPanel.tsx    # Admin controls (delay, on/off)
    StatusBar.tsx        # Last sync info, connection status
  routes/
    index.tsx            # Public map page
    admin.tsx            # Gianni's control panel
    api/
      ingest.ts          # POST - receive GPS points
      track.ts           # GET - public delayed track
      family.ts          # GET - family access (token-auth)
      device/
        config.ts        # GET - device pull config
  lib/
    geo.ts               # Downsampling, distance calculations
    delay.ts             # Delay enforcement logic
    db.ts                # Database access layer
  i18n/
    it.ts                # Italian translations
    en.ts                # English translations
```
