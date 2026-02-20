import { getDb, media, points, setConfig } from "../src/lib/db";

const now = Date.now();
const hour = 60 * 60 * 1000;

type Waypoint = { lat: number; lng: number };
type Leg = { from: Waypoint; to: Waypoint; segment_type: "ground" | "plane" | "boat"; steps: number };

function interpolate(from: Waypoint, to: Waypoint, steps: number): Waypoint[] {
  const out: Waypoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    out.push({
      lat: from.lat + t * (to.lat - from.lat),
      lng: from.lng + t * (to.lng - from.lng)
    });
  }
  return out;
}

const legs: Leg[] = [
  { from: { lat: 43.84, lng: 10.5 }, to: { lat: 44.82, lng: 20.46 }, segment_type: "ground", steps: 45 },
  { from: { lat: 44.82, lng: 20.46 }, to: { lat: 42.7, lng: 23.32 }, segment_type: "ground", steps: 25 },
  { from: { lat: 42.7, lng: 23.32 }, to: { lat: 41.01, lng: 28.98 }, segment_type: "ground", steps: 35 },
  { from: { lat: 41.01, lng: 28.98 }, to: { lat: 41.72, lng: 44.78 }, segment_type: "ground", steps: 50 },
  { from: { lat: 41.72, lng: 44.78 }, to: { lat: 37.95, lng: 58.38 }, segment_type: "plane", steps: 8 },
  { from: { lat: 37.95, lng: 58.38 }, to: { lat: 39.65, lng: 66.96 }, segment_type: "ground", steps: 40 },
  { from: { lat: 39.65, lng: 66.96 }, to: { lat: 47.92, lng: 106.91 }, segment_type: "ground", steps: 80 },
  { from: { lat: 47.92, lng: 106.91 }, to: { lat: 39.9, lng: 116.41 }, segment_type: "ground", steps: 55 },
  { from: { lat: 39.9, lng: 116.41 }, to: { lat: 31.23, lng: 121.47 }, segment_type: "ground", steps: 50 },
  { from: { lat: 31.23, lng: 121.47 }, to: { lat: 37.57, lng: 126.98 }, segment_type: "boat", steps: 15 },
  { from: { lat: 37.57, lng: 126.98 }, to: { lat: 35.1, lng: 129.04 }, segment_type: "ground", steps: 30 },
  { from: { lat: 35.1, lng: 129.04 }, to: { lat: 35.68, lng: 139.69 }, segment_type: "boat", steps: 20 },
  { from: { lat: 35.65, lng: 139.7 }, to: { lat: 35.68, lng: 139.69 }, segment_type: "ground", steps: 5 }
];

const allPoints: Array<{ lat: number; lng: number; device_ts: number; segment_type: "ground" | "plane" | "boat" }> = [];
let t = now - 400 * hour;
for (const leg of legs) {
  const pts = interpolate(leg.from, leg.to, leg.steps);
  const stepMs = (2 * hour) / Math.max(1, pts.length - 1);
  for (let i = 0; i < pts.length; i++) {
    if (i === pts.length - 1 && leg.from.lat === leg.to.lat && leg.from.lng === leg.to.lng) continue;
    allPoints.push({
      lat: pts[i].lat,
      lng: pts[i].lng,
      device_ts: Math.round(t),
      segment_type: leg.segment_type
    });
    t += stepMs;
  }
}

const db = getDb();
const serverTs = Date.now();
let inserted = 0;
for (const p of allPoints) {
  const r = db
    .insert(points)
    .values({
      lat: p.lat,
      lng: p.lng,
      deviceTs: p.device_ts,
      serverTs,
      segmentType: p.segment_type
    })
    .onConflictDoNothing({ target: [points.deviceTs, points.lat, points.lng] })
    .run();
  if (r.changes > 0) inserted++;
}

setConfig("sharing_enabled", "1");
setConfig("public_delay_hours", "168");

const orderedIds = db.select({ id: points.id }).from(points).orderBy(points.deviceTs).all();
const n = orderedIds.length;
if (n === 0) {
  console.log("No points in DB. Ensure DB is writable and DATABASE_PATH is correct.");
  process.exit(1);
}

const mediaTemplates: Array<{ type: "image" | "video"; provider: "youtube" | "imgur" | "local"; url: string; title: string; description: string }> = [
  { type: "image", provider: "local", url: "/media/photo-1.jpg", title: "Lucca walls", description: "Morning at the walls of Lucca." },
  { type: "video", provider: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", title: "Road diary 1", description: "First leg towards Serbia." },
  { type: "image", provider: "imgur", url: "https://i.imgur.com/placeholder.jpg", title: "Belgrade", description: "Arrival in Belgrade." },
  { type: "video", provider: "local", url: "/media/clip-1.mp4", title: "Sofia", description: "Short clip in Sofia." },
  { type: "image", provider: "local", url: "/media/photo-2.jpg", title: "Istanbul", description: "Bosphorus view." },
  { type: "video", provider: "youtube", url: "https://www.youtube.com/watch?v=jNQXAC9IVRw", title: "Turkey coast", description: "Coastal stretch." },
  { type: "image", provider: "imgur", url: "https://i.imgur.com/placeholder2.jpg", title: "Tbilisi", description: "Georgia capital." },
  { type: "video", provider: "local", url: "/media/clip-2.mp4", title: "Flight to Ashgabat", description: "From the plane." },
  { type: "image", provider: "local", url: "/media/photo-3.jpg", title: "Ashgabat", description: "Turkmenistan." },
  { type: "video", provider: "youtube", url: "https://www.youtube.com/watch?v=9bZkp7q19f0", title: "Samarkand", description: "Registan." },
  { type: "image", provider: "imgur", url: "https://i.imgur.com/placeholder3.jpg", title: "Steppe", description: "Mongolian steppe." },
  { type: "video", provider: "local", url: "/media/clip-3.mp4", title: "Ulan Bator", description: "Ulaanbaatar." },
  { type: "image", provider: "local", url: "/media/photo-4.jpg", title: "Beijing", description: "Forbidden City area." },
  { type: "video", provider: "youtube", url: "https://www.youtube.com/watch?v=2Vv-BfVoq4g", title: "Great Wall", description: "Great Wall visit." },
  { type: "image", provider: "imgur", url: "https://i.imgur.com/placeholder4.jpg", title: "Shanghai", description: "Bund at night." },
  { type: "video", provider: "local", url: "/media/clip-4.mp4", title: "Ferry to Korea", description: "Boat to Seoul." },
  { type: "image", provider: "local", url: "/media/photo-5.jpg", title: "Seoul", description: "Seoul downtown." },
  { type: "video", provider: "youtube", url: "https://www.youtube.com/watch?v=placeholder", title: "Busan", description: "East coast." },
  { type: "image", provider: "imgur", url: "https://i.imgur.com/placeholder5.jpg", title: "Ferry to Japan", description: "Departure." },
  { type: "video", provider: "local", url: "/media/clip-5.mp4", title: "Tokyo", description: "Arrival in Tokyo." }
];

const mediaEntries: Array<{ pointIndex: number; type: "image" | "video"; provider: "youtube" | "imgur" | "local"; url: string; title: string; description: string }> = [];
for (let i = 0; i < 105; i++) {
  const template = mediaTemplates[i % mediaTemplates.length];
  const pointIndex = Math.floor((i / 105) * (n - 1));
  mediaEntries.push({
    pointIndex,
    type: template.type,
    provider: template.provider,
    url: template.url.replace("placeholder", `p${i}`).replace("photo-1", `photo-${(i % 20) + 1}`).replace("clip-1", `clip-${(i % 10) + 1}`),
    title: `${template.title} (${i + 1})`,
    description: template.description
  });
}

let mediaInserted = 0;
for (const entry of mediaEntries) {
  const idx = Math.min(entry.pointIndex, orderedIds.length - 1);
  const pointId = orderedIds[idx].id;
  db.insert(media)
    .values({
      pointId,
      type: entry.type,
      url: entry.url,
      title: entry.title,
      description: entry.description,
      provider: entry.provider
    })
    .run();
  mediaInserted++;
}

console.log(`Seed: ${inserted} new points (${allPoints.length} in script), ${mediaInserted} media. Total points in DB: ${n}.`);
console.log("Public delay set to 168h so all points are visible on GET /api/track.");
