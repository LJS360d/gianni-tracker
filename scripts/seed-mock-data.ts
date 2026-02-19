import { getDb, media, points, setConfig } from "../src/lib/db";

const now = Date.now();
const hour = 60 * 60 * 1000;

const mockTrack: Array<{ lat: number; lng: number; device_ts: number }> = [
  { lat: 45.4642, lng: 9.19, device_ts: now - 90 * hour },
  { lat: 45.47, lng: 9.22, device_ts: now - 89 * hour },
  { lat: 45.48, lng: 9.25, device_ts: now - 88 * hour },
  { lat: 45.49, lng: 9.28, device_ts: now - 87 * hour },
  { lat: 45.5, lng: 9.3, device_ts: now - 86 * hour },
  { lat: 45.52, lng: 9.32, device_ts: now - 85 * hour },
  { lat: 45.54, lng: 9.35, device_ts: now - 84 * hour },
  { lat: 45.56, lng: 9.38, device_ts: now - 83 * hour },
  { lat: 45.58, lng: 9.4, device_ts: now - 82 * hour },
  { lat: 45.6, lng: 9.42, device_ts: now - 81 * hour },
  { lat: 45.62, lng: 9.45, device_ts: now - 80 * hour },
  { lat: 45.64, lng: 9.48, device_ts: now - 79 * hour },
  { lat: 45.66, lng: 9.5, device_ts: now - 78 * hour },
  { lat: 45.68, lng: 9.52, device_ts: now - 77 * hour },
  { lat: 45.7, lng: 9.55, device_ts: now - 76 * hour },
  { lat: 45.72, lng: 9.58, device_ts: now - 75 * hour },
  { lat: 45.74, lng: 9.6, device_ts: now - 74 * hour },
  { lat: 45.76, lng: 9.62, device_ts: now - 73 * hour },
  { lat: 45.78, lng: 9.65, device_ts: now - 72 * hour },
  { lat: 45.8, lng: 9.68, device_ts: now - 71 * hour },
  { lat: 45.82, lng: 9.7, device_ts: now - 70 * hour },
  { lat: 45.84, lng: 9.72, device_ts: now - 69 * hour },
  { lat: 45.86, lng: 9.75, device_ts: now - 68 * hour },
  { lat: 45.88, lng: 9.78, device_ts: now - 67 * hour },
  { lat: 45.9, lng: 9.8, device_ts: now - 66 * hour },
  { lat: 45.92, lng: 9.82, device_ts: now - 65 * hour },
  { lat: 45.94, lng: 9.85, device_ts: now - 64 * hour },
  { lat: 45.96, lng: 9.88, device_ts: now - 63 * hour },
  { lat: 45.98, lng: 9.9, device_ts: now - 62 * hour },
  { lat: 46.0, lng: 9.92, device_ts: now - 61 * hour },
  { lat: 46.02, lng: 9.95, device_ts: now - 60 * hour },
  { lat: 46.04, lng: 9.98, device_ts: now - 59 * hour },
  { lat: 46.06, lng: 10.0, device_ts: now - 58 * hour },
  { lat: 46.08, lng: 10.02, device_ts: now - 57 * hour },
  { lat: 46.1, lng: 10.05, device_ts: now - 56 * hour },
  { lat: 46.12, lng: 10.08, device_ts: now - 55 * hour },
  { lat: 46.14, lng: 10.1, device_ts: now - 54 * hour },
  { lat: 46.16, lng: 10.12, device_ts: now - 53 * hour },
  { lat: 46.18, lng: 10.15, device_ts: now - 52 * hour },
  { lat: 46.2, lng: 10.18, device_ts: now - 51 * hour },
  { lat: 46.22, lng: 10.2, device_ts: now - 50 * hour }
];

const db = getDb();
let inserted = 0;
const serverTs = Date.now();
for (const p of mockTrack) {
  const r = db
    .insert(points)
    .values({
      lat: p.lat,
      lng: p.lng,
      deviceTs: p.device_ts,
      serverTs
    })
    .onConflictDoNothing({ target: [points.deviceTs, points.lat, points.lng] })
    .run();
  if (r.changes > 0) inserted++;
}

setConfig("sharing_enabled", "1");
setConfig("public_delay_hours", "48");

const orderedIds = db.select({ id: points.id }).from(points).orderBy(points.deviceTs).all();
const mediaIndices = [5, 12, 22, 35];
const mockMediaRows: Array<{ pointId: number; type: "image" | "video"; url: string; title: string; description: string }> = [
  { pointId: 0, type: "image", url: "https://placehold.co/600x400/1a1a1a/666?text=Photo", title: "First stop", description: "View from the road near the first leg of the trip." },
  { pointId: 0, type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Road clip", description: "Short clip from the journey." },
  { pointId: 0, type: "image", url: "https://placehold.co/600x400/2a2a2a/888?text=Photo", title: "Halfway", description: "Scenic spot at the midpoint." },
  { pointId: 0, type: "video", url: "https://www.youtube.com/watch?v=jNQXAC9IVRw", title: "Arrival", description: "Footage from the final stretch." }
];
let mediaInserted = 0;
for (let i = 0; i < mediaIndices.length; i++) {
  const idx = mediaIndices[i];
  if (idx >= orderedIds.length) continue;
  const row = mockMediaRows[i];
  db.insert(media).values({
    pointId: orderedIds[idx].id,
    type: row.type,
    url: row.url,
    title: row.title,
    description: row.description
  }).run();
  mediaInserted++;
}

console.log(`Seed complete: ${inserted} new points (${mockTrack.length} total in script), ${mediaInserted} media entries.`);
console.log("With 48h delay, points older than 48h will appear on GET /api/track.");
