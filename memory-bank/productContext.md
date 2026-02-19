# Product Context — Gianni Tracker

## Problem

Gianni travels with a GPS tracker on 2G connectivity. He wants followers to see his route, but:
- He cannot stream position in real time (device limitation)
- He does not want anyone to know his exact current location (privacy/security)
- He needs the map to be shareable: embeddable in videos, viewable on TV, accessible via link

## Solution

A web app that ingests GPS points asynchronously, stores them with dual timestamps, and exposes a public map page that only shows points older than a configurable delay threshold.

## User Experiences

### Public Follower
Opens the link → sees a dark-themed map with Gianni's track drawn as a white line with dots → track stops at the delay boundary (e.g., 48h ago) → no indication of current position.

### Gianni (Admin)
Toggles sharing on/off → adjusts delay → changes take effect at next device check-in. Can see when the device last synced.

### Family Member
Uses a token/code to access a protected endpoint → sees position with reduced delay (still not live).

## Design Principles

- **Privacy first**: delay is server-enforced, not client-side
- **Resilience**: handles burst data, out-of-order points, gaps in connectivity
- **Simplicity**: the public page is a single map view, minimal UI, dark theme
- **Embeddability**: works as a standalone page or webview, responsive from mobile to TV
- **Offline capable**: PWA with cached tiles for areas already viewed
