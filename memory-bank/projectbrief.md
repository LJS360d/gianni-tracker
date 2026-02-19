# Project Brief — Gianni Tracker

## What

A web application that displays a GPS tracker's position on a public map, allowing people to follow Gianni's journey. The position is shown with a mandatory time delay for privacy/security.

## Who

- **Gianni**: Traveler carrying a 2G GPS tracker device. Controls sharing on/off and delay settings.
- **Public followers**: Anyone with the link can see the delayed track on a map.
- **Family**: Privileged access via token to request more recent (but still not live) position data.

## Why

Gianni wants followers to see where he's been, but never where he *is*. The device operates on 2G with intermittent connectivity, so data arrives sporadically in bursts. The map page must also be embeddable as a webview (e.g., in videos, on a TV).

## Core Requirements

1. **Public map page** with delayed position track (configurable delay, default 48–72h)
2. **Kill switch**: Gianni can disable public sharing entirely
3. **Burst ingestion API**: accepts batches of GPS points from a buffering device
4. **Dual timestamps**: `device_ts` (when recorded) + `server_ts` (when received)
5. **Downsampling**: lightweight track mode for high-frequency point data
6. **Family access**: token-protected endpoint for closer-to-real-time position
7. **Device pull config**: device fetches plain-text config from server on check-in
8. **PWA**: installable, works offline with cached map tiles
9. **i18n**: Italian primary, English fallback
10. **Dark map**: Leaflet with dark tile provider (CartoDB Dark Matter)

## Constraints

- Device connectivity: 2G, sporadic, sends data in bursts (e.g., every 12h or after days)
- Public page must NEVER expose real-time position (delay is enforced server-side)
- Config changes to device apply only at next check-in (latency is expected)
- Map must be embeddable as webview and display well on TV screens

## Mockup Reference

See `/assets/mockup.png` — dark map with white track line connecting position dots across Central/Southern Europe. Gear icon top-right for settings.
