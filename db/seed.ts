import { db, points, media, config } from "astro:db";

// https://astro.build/db/seed
export default async function seed() {
  // Only run in development
  if (import.meta.env.PROD) {
    console.log("Not in development environment, skipping seed.");
    return;
  }

  const now = Date.now();
  const hour = 60 * 60 * 1000;

  type Waypoint = { lat: number; lng: number };
  type SegmentType = "ground" | "plane" | "boat";
  type Leg = {
    from: Waypoint;
    to: Waypoint;
    segment_type: SegmentType;
    steps: number;
  };

  function interpolate(
    from: Waypoint,
    to: Waypoint,
    steps: number,
  ): Waypoint[] {
    const out: Waypoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      out.push({
        lat: from.lat + t * (to.lat - from.lat),
        lng: from.lng + t * (to.lng - from.lng),
      });
    }
    return out;
  }

  const legs: Leg[] = [
    {
      from: { lat: 43.84, lng: 10.5 },
      to: { lat: 44.82, lng: 20.46 },
      segment_type: "ground",
      steps: 45,
    },
    {
      from: { lat: 44.82, lng: 20.46 },
      to: { lat: 42.7, lng: 23.32 },
      segment_type: "ground",
      steps: 25,
    },
    {
      from: { lat: 42.7, lng: 23.32 },
      to: { lat: 41.01, lng: 28.98 },
      segment_type: "ground",
      steps: 35,
    },
    {
      from: { lat: 41.01, lng: 28.98 },
      to: { lat: 41.72, lng: 44.78 },
      segment_type: "ground",
      steps: 50,
    },
    {
      from: { lat: 41.72, lng: 44.78 },
      to: { lat: 37.95, lng: 58.38 },
      segment_type: "plane",
      steps: 8,
    },
    {
      from: { lat: 37.95, lng: 58.38 },
      to: { lat: 39.65, lng: 66.96 },
      segment_type: "ground",
      steps: 40,
    },
    {
      from: { lat: 39.65, lng: 66.96 },
      to: { lat: 47.92, lng: 106.91 },
      segment_type: "ground",
      steps: 80,
    },
    {
      from: { lat: 47.92, lng: 106.91 },
      to: { lat: 39.9, lng: 116.41 },
      segment_type: "ground",
      steps: 55,
    },
    {
      from: { lat: 39.9, lng: 116.41 },
      to: { lat: 31.23, lng: 121.47 },
      segment_type: "ground",
      steps: 50,
    },
    {
      from: { lat: 31.23, lng: 121.47 },
      to: { lat: 37.57, lng: 126.98 },
      segment_type: "boat",
      steps: 15,
    },
    {
      from: { lat: 37.57, lng: 126.98 },
      to: { lat: 35.1, lng: 129.04 },
      segment_type: "ground",
      steps: 30,
    },
    {
      from: { lat: 35.1, lng: 129.04 },
      to: { lat: 35.68, lng: 139.69 },
      segment_type: "boat",
      steps: 20,
    },
    {
      from: { lat: 35.65, lng: 139.7 },
      to: { lat: 35.68, lng: 139.69 },
      segment_type: "ground",
      steps: 5,
    },
  ];

  const allPointsToInsert: any[] = [];
  let currentTime = now - 400 * hour;
  const serverTs = Date.now();

  for (const leg of legs) {
    const pts = interpolate(leg.from, leg.to, leg.steps);
    const stepMs = (2 * hour) / Math.max(1, pts.length - 1);
    for (let i = 0; i < pts.length; i++) {
      if (
        i === pts.length - 1 &&
        leg.from.lat === leg.to.lat &&
        leg.from.lng === leg.to.lng
      )
        continue;
      allPointsToInsert.push({
        lat: pts[i].lat,
        lng: pts[i].lng,
        deviceTs: Math.round(currentTime),
        serverTs,
        segmentType: leg.segment_type,
      });
      currentTime += stepMs;
    }
  }

  // Insert Points
  // Note: Astro DB doesn't support .onConflictDoNothing() in the seed helper easily,
  // but since seed usually runs on an empty DB, we use standard insert.
  await db.insert(points).values(allPointsToInsert);

  // Set Config
  await db.insert(config).values([
    { key: "sharing_enabled", value: "1" },
    { key: "public_delay_hours", value: "168" },
  ]);

  // Fetch inserted points to get IDs for media
  const insertedPoints = await db
    .select()
    .from(points)
    .orderBy(points.deviceTs);
  const n = insertedPoints.length;

  if (n === 0) return;

  const mediaTemplates = [
    {
      type: "image",
      url: "/data/photo-1.jpg",
      title: "Lucca walls",
      description: "Morning at the walls of Lucca.",
    },
    {
      type: "video",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Road diary 1",
      description: "First leg towards Serbia.",
    },
    {
      type: "image",
      url: "https://i.imgur.com/placeholder.jpg",
      title: "Belgrade",
      description: "Arrival in Belgrade.",
    },
    {
      type: "video",
      url: "/data/clip-1.mp4",
      title: "Sofia",
      description: "Short clip in Sofia.",
    },
    {
      type: "image",
      url: "/data/photo-2.jpg",
      title: "Istanbul",
      description: "Bosphorus view.",
    },
    {
      type: "video",
      url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      title: "Turkey coast",
      description: "Coastal stretch.",
    },
    {
      type: "image",
      url: "https://i.imgur.com/placeholder2.jpg",
      title: "Tbilisi",
      description: "Georgia capital.",
    },
    {
      type: "video",
      url: "/data/clip-2.mp4",
      title: "Flight to Ashgabat",
      description: "From the plane.",
    },
    {
      type: "image",
      url: "/data/photo-3.jpg",
      title: "Ashgabat",
      description: "Turkmenistan.",
    },
    {
      type: "video",
      url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
      title: "Samarkand",
      description: "Registan.",
    },
    {
      type: "image",
      url: "https://i.imgur.com/placeholder3.jpg",
      title: "Steppe",
      description: "Mongolian steppe.",
    },
    {
      type: "video",
      url: "/data/clip-3.mp4",
      title: "Ulan Bator",
      description: "Ulaanbaatar.",
    },
    {
      type: "image",
      url: "/data/photo-4.jpg",
      title: "Beijing",
      description: "Forbidden City area.",
    },
    {
      type: "video",
      url: "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
      title: "Great Wall",
      description: "Great Wall visit.",
    },
    {
      type: "image",
      url: "https://i.imgur.com/placeholder4.jpg",
      title: "Shanghai",
      description: "Bund at night.",
    },
    {
      type: "video",
      url: "/data/clip-4.mp4",
      title: "Ferry to Korea",
      description: "Boat to Seoul.",
    },
    {
      type: "image",
      url: "/data/photo-5.jpg",
      title: "Seoul",
      description: "Seoul downtown.",
    },
    {
      type: "video",
      url: "https://www.youtube.com/watch?v=placeholder",
      title: "Busan",
      description: "East coast.",
    },
    {
      type: "image",
      url: "https://i.imgur.com/placeholder5.jpg",
      title: "Ferry to Japan",
      description: "Departure.",
    },
    {
      type: "video",
      url: "/data/clip-5.mp4",
      title: "Tokyo",
      description: "Arrival in Tokyo.",
    },
  ];

  const mediaToInsert: any[] = [];
  const createdAt = Math.floor(Date.now() / 1000);

  for (let i = 0; i < 105; i++) {
    const template = mediaTemplates[i % mediaTemplates.length];
    const pointIndex = Math.floor((i / 105) * (n - 1));
    const pointId = insertedPoints[pointIndex].id;

    mediaToInsert.push({
      pointId,
      type: template.type,
      url: template.url
        .replace("placeholder", `p${i}`)
        .replace("photo-1", `photo-${(i % 20) + 1}`)
        .replace("clip-1", `clip-${(i % 10) + 1}`),
      title: `${template.title} (${i + 1})`,
      description: template.description,
      createdAt,
    });
  }

  await db.insert(media).values(mediaToInsert);

  console.log(
    `Seed complete: ${allPointsToInsert.length} points and ${mediaToInsert.length} media items inserted.`,
  );
}
