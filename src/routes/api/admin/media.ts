import type { APIEvent } from "@solidjs/start/server";
import { checkAdmin, jsonResponse, unauthorized } from "~/lib/admin-auth";
import {
  countMedia,
  getPointById,
  insertMedia,
  listMediaWithPoints,
  type ListMediaFilters,
  type MediaSortColumn
} from "~/lib/db";
import { type MediaType } from "~/lib/schema";

const SORT_COLUMNS: MediaSortColumn[] = ["id", "created_at", "taken_at", "title"];
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v", ".avi", ".mkv"]);

function inferMediaType(url: string): MediaType {
  const lower = url.trim().toLowerCase();
  if (VIDEO_EXT.has(lower.slice(lower.lastIndexOf(".")))) return "video";
  return "image";
}

export async function GET(event: APIEvent) {
  if (!checkAdmin(event.request)) return unauthorized();
  const url = new URL(event.request.url);
  const point_id = url.searchParams.get("point_id");
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "25", 10) || 25));
  const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10) || 0);
  const sortParam = url.searchParams.get("sort");
  const sort: MediaSortColumn = SORT_COLUMNS.includes(sortParam as MediaSortColumn) ? (sortParam as MediaSortColumn) : "created_at";
  const order = url.searchParams.get("order") === "asc" ? "asc" : "desc";
  const filters: ListMediaFilters = { limit, offset, sort, order };
  if (point_id != null) {
    const n = parseInt(point_id, 10);
    if (Number.isFinite(n)) filters.point_id = n;
  }
  const total = countMedia({ point_id: filters.point_id });
  const rows = listMediaWithPoints(filters);
  const list = rows.map(r => ({
    id: r.id,
    point_id: r.pointId,
    point_device_ts: r.point_device_ts,
    point_lat: r.point_lat,
    point_lng: r.point_lng,
    type: r.type,
    url: r.url,
    title: r.title,
    description: r.description,
    created_at: r.createdAt,
    taken_at: r.takenAt,
    taken_lat: r.takenLat,
    taken_lng: r.takenLng
  }));
  const res = jsonResponse(list);
  res.headers.set("X-Total-Count", String(total));
  return res;
}

export async function POST(event: APIEvent) {
  if (!checkAdmin(event.request)) return unauthorized();
  let body: {
    point_id?: number;
    url?: string;
    title?: string;
    description?: string;
    taken_at?: number | null;
    taken_lat?: number | null;
    taken_lng?: number | null;
  };
  try {
    body = await event.request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }
  const point_id = body.point_id;
  const url = body.url;
  const title = body.title ?? "";
  const description = body.description ?? "";
  if (point_id == null || typeof point_id !== "number") {
    return jsonResponse({ error: "point_id required" }, 400);
  }
  const point = getPointById(point_id);
  if (!point) return jsonResponse({ error: "Point not found" }, 400);
  if (!url || typeof url !== "string" || url.trim() === "") {
    return jsonResponse({ error: "url required" }, 400);
  }
  const type = inferMediaType(url);
  const row = insertMedia({
    pointId: point_id,
    type,
    url: url.trim(),
    title: title.trim(),
    description: description.trim(),
    takenAt: body.taken_at ?? null,
    takenLat: body.taken_lat ?? null,
    takenLng: body.taken_lng ?? null
  });
  return jsonResponse({
    id: row.id,
    point_id: row.pointId,
    type: row.type,
    url: row.url,
    title: row.title,
    description: row.description,
    created_at: row.createdAt,
    taken_at: row.takenAt,
    taken_lat: row.takenLat,
    taken_lng: row.takenLng
  }, 201);
}
