import type { APIRoute } from "astro";
import { db, points, lt, asc } from "astro:db";
import { getDelayHours, getMediaByPointIds, isSharingEnabled } from "@/lib/db";
import { downsampleTrack, type Point } from "@/lib/geo";

export const GET: APIRoute = async () => {
  try {
    // 1. Security/Feature Check
    if (!isSharingEnabled()) {
      return new Response(JSON.stringify({ points: [], media: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Calculate Cutoff
    const delayHours = await getDelayHours();
    const cutoff = Date.now() - delayHours * 60 * 60 * 1000;

    // 3. Query using Astro DB
    // Note: Use 'Points' (the schema name you defined in db/config.ts)
    const rows = await db
      .select({
        id: points.id,
        lat: points.lat,
        lng: points.lng,
        deviceTs: points.deviceTs,
        segmentType: points.segmentType,
      })
      .from(points)
      .where(lt(points.deviceTs, cutoff))
      .orderBy(asc(points.deviceTs));

    // 4. Transform Data
    const trackPoints: Point[] = rows.map((r) => ({
      lat: r.lat,
      lng: r.lng,
      device_ts: r.deviceTs,
      segment_type: r.segmentType ?? "ground",
    }));

    const downsampled = downsampleTrack(trackPoints);

    // Efficiently find IDs for downsampled points
    const downsampledIds = downsampled.map(
      (p) =>
        rows.find(
          (r) =>
            r.lat === p.lat && r.lng === p.lng && r.deviceTs === p.device_ts,
        )!.id,
    );

    // 5. Fetch Media
    const mediaRows = await getMediaByPointIds(downsampledIds);
    const media = mediaRows.map((m) => ({
      pointIndex: downsampledIds.indexOf(m.pointId),
      type: m.type,
      url: m.url,
      title: m.title,
      description: m.description,
    }));

    // 6. Return Structured Response
    return new Response(
      JSON.stringify({
        points: downsampled,
        media,
        delay_hours: delayHours,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Standard Node/Astro structured log in terminal
    console.error("[GET /api/track]", err);

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
