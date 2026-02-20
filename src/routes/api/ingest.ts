import type { APIEvent } from "@solidjs/start/server";
import { getDb, points } from "~/lib/db";
import { segmentTypes, type SegmentType } from "~/lib/schema";

const DEVICE_TOKEN = process.env.DEVICE_AUTH_TOKEN ?? "";

type IngestPoint = {
  lat: number;
  lng: number;
  device_ts: number | string;
  segment_type?: string;
};

export function parseDeviceTs(v: number | string): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    if (Number.isFinite(n)) return n;
    const d = Date.parse(v);
    if (Number.isFinite(d)) return d;
  }
  return 0;
}

export function validatePoint(p: unknown): IngestPoint | null {
  if (!p || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  const lat = Number(o.lat);
  const lng = Number(o.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  const device_ts = parseDeviceTs((o.device_ts as number | string) ?? 0);
  if (device_ts <= 0) return null;
  const rawSegment = o.segment_type as string | undefined;
  const segment_type =
    typeof rawSegment === "string" && (segmentTypes as readonly string[]).includes(rawSegment)
      ? (rawSegment as SegmentType)
      : "ground";
  return { lat, lng, device_ts, segment_type };
}

export async function POST(event: APIEvent) {
  if (DEVICE_TOKEN && event.request.headers.get("Authorization") !== `Bearer ${DEVICE_TOKEN}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  let body: unknown;
  try {
    body = await event.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const rawPoints = Array.isArray((body as { points?: unknown }).points)
    ? (body as { points: unknown[] }).points
    : Array.isArray(body)
      ? body
      : [];

  const serverTs = Date.now();
  const db = getDb();

  const results: { accepted: number; rejected: number; duplicate: number } = {
    accepted: 0,
    rejected: 0,
    duplicate: 0
  };

  for (const raw of rawPoints) {
    const p = validatePoint(raw);
    if (!p) {
      results.rejected++;
      continue;
    }
    try {
      const result = db
        .insert(points)
        .values({
          lat: p.lat,
          lng: p.lng,
          deviceTs: Number(p.device_ts),
          serverTs,
          segmentType: p.segment_type ?? "ground"
        })
        .onConflictDoNothing({ target: [points.deviceTs, points.lat, points.lng] })
        .run();
      if (result.changes > 0) results.accepted++;
      else results.duplicate++;
    } catch {
      results.rejected++;
    }
  }

  return new Response(
    JSON.stringify({ ok: true, ...results }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
