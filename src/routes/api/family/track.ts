import type { APIEvent } from "@solidjs/start/server";
import { getDb, getMediaByPointIds, isSharingEnabled, points } from "~/lib/db";
import { downsampleTrack, type Point } from "~/lib/geo";
import { lt } from "drizzle-orm";

const FAMILY_TOKEN = process.env.FAMILY_ACCESS_TOKEN ?? "";
const FAMILY_DELAY_HOURS = (() => {
  const n = parseInt(process.env.FAMILY_DELAY_HOURS ?? "6", 10);
  return Number.isFinite(n) && n >= 0 ? n : 6;
})();

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
}

export async function GET(event: APIEvent) {
  if (FAMILY_TOKEN && event.request.headers.get("Authorization") !== `Bearer ${FAMILY_TOKEN}`) {
    return unauthorized();
  }
  try {
    if (!isSharingEnabled()) {
      return new Response(JSON.stringify({ points: [], media: [], delay_hours: FAMILY_DELAY_HOURS }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const delayHours = FAMILY_DELAY_HOURS;
    const cutoff = Date.now() - delayHours * 60 * 60 * 1000;
    const db = getDb();
    const rows = db
      .select({ id: points.id, lat: points.lat, lng: points.lng, deviceTs: points.deviceTs, segmentType: points.segmentType })
      .from(points)
      .where(lt(points.deviceTs, cutoff))
      .orderBy(points.deviceTs)
      .all();
    const trackPoints: Point[] = rows.map(r => ({
      lat: r.lat,
      lng: r.lng,
      device_ts: r.deviceTs,
      segment_type: r.segmentType ?? "ground"
    }));
    const downsampled = downsampleTrack(trackPoints);
    const downsampledIds = downsampled.map(
      p => rows.find(r => r.lat === p.lat && r.lng === p.lng && r.deviceTs === p.device_ts)!.id
    );
    const mediaRows = getMediaByPointIds(downsampledIds);
    const media = mediaRows.map(m => ({
      pointIndex: downsampledIds.indexOf(m.pointId),
      type: m.type,
      url: m.url,
      title: m.title,
      description: m.description,
      provider: m.provider ?? undefined
    }));
    return new Response(
      JSON.stringify({ points: downsampled, media, delay_hours: delayHours }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/family/track]", err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
