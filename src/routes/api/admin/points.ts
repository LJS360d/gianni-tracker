import type { APIEvent } from "@solidjs/start/server";
import { checkAdmin, jsonResponse, unauthorized } from "~/lib/admin-auth";
import { listPointsForAdmin } from "~/lib/db";

export async function GET(event: APIEvent) {
  if (!checkAdmin(event.request)) return unauthorized();
  const url = new URL(event.request.url);
  const limit = Math.min(500, Math.max(1, parseInt(url.searchParams.get("limit") ?? "200", 10) || 200));
  const points = listPointsForAdmin(limit);
  const list = points.map(p => ({
    id: p.id,
    device_ts: p.deviceTs,
    lat: p.lat,
    lng: p.lng
  }));
  return jsonResponse(list);
}
