import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { config, media, points, type InsertMedia, type Media } from "./schema";

const DB_PATH = process.env.DATABASE_PATH ?? join(process.cwd(), "data", "main.db");

let _db: ReturnType<typeof drizzle> | null = null;

function ensureDb() {
  if (_db) return _db;
  const dir = dirname(DB_PATH);
  mkdirSync(dir, { recursive: true });
  const sqlite = new Database(DB_PATH);
  _db = drizzle(sqlite);
  try {
    const count = sqlite.prepare("SELECT COUNT(*) as c FROM config").get() as { c: number } | undefined;
    if (count?.c === 0) {
      sqlite.exec(
        "INSERT INTO config (key, value) VALUES ('sharing_enabled', '1'), ('public_delay_hours', '48')"
      );
    }
  } catch {}
  return _db;
}

export function getDb() {
  return ensureDb();
}

export function getDelayHours(): number {
  const db = ensureDb();
  const row = db.select().from(config).where(eq(config.key, "public_delay_hours")).get();
  const n = row ? parseInt(row.value, 10) : 48;
  return Number.isFinite(n) ? n : 48;
}

export function isSharingEnabled(): boolean {
  const db = ensureDb();
  const row = db.select().from(config).where(eq(config.key, "sharing_enabled")).get();
  return row?.value === "1";
}

export function setConfig(key: string, value: string): void {
  const db = ensureDb();
  db.insert(config).values({ key, value }).onConflictDoUpdate({ target: config.key, set: { value } }).run();
}

export function getLastSyncServerTs(): number | null {
  const db = ensureDb();
  const rows = db.select({ serverTs: points.serverTs }).from(points).orderBy(desc(points.serverTs)).limit(1).all();
  return rows[0]?.serverTs ?? null;
}

export function getMediaByPointIds(pointIds: number[]): Array<Pick<Media, "pointId" | "type" | "url" | "title" | "description">> {
  if (pointIds.length === 0) return [];
  const db = ensureDb();
  return db
    .select({
      pointId: media.pointId,
      type: media.type,
      url: media.url,
      title: media.title,
      description: media.description
    })
    .from(media)
    .where(inArray(media.pointId, pointIds))
    .all();
}

export type MediaSortColumn = "id" | "created_at" | "taken_at" | "title";
export type ListMediaFilters = {
  point_id?: number;
  limit?: number;
  offset?: number;
  sort?: MediaSortColumn;
  order?: "asc" | "desc";
};

export function countMedia(filters: Omit<ListMediaFilters, "limit" | "offset" | "sort" | "order"> = {}) {
  const db = ensureDb();
  let q = db.select({ count: sql<number>`count(*)` }).from(media).$dynamic();
  if (filters.point_id != null) q = q.where(eq(media.pointId, filters.point_id));
  const row = q.get();
  return Number(row?.count ?? 0);
}

export function listMedia(filters: ListMediaFilters = {}) {
  const db = ensureDb();
  const { point_id, limit = 100, offset = 0, sort = "created_at", order = "desc" } = filters;
  let q = db
    .select()
    .from(media)
    .$dynamic();
  if (point_id != null) q = q.where(eq(media.pointId, point_id));
  const orderByCol = sort === "id" ? media.id : sort === "title" ? media.title : sort === "taken_at" ? media.takenAt : media.createdAt;
  const ordered = order === "asc" ? q.orderBy(asc(orderByCol)) : q.orderBy(desc(orderByCol));
  return ordered.limit(limit).offset(offset).all();
}

export function listMediaWithPoints(filters: ListMediaFilters = {}) {
  const rows = listMedia(filters);
  if (rows.length === 0) return [];
  const db = ensureDb();
  const pointIds = [...new Set(rows.map(r => r.pointId))];
  const pointRows = db
    .select({ id: points.id, deviceTs: points.deviceTs, lat: points.lat, lng: points.lng })
    .from(points)
    .where(inArray(points.id, pointIds))
    .all();
  const byId = Object.fromEntries(pointRows.map(p => [p.id, p]));
  return rows.map(r => {
    const p = byId[r.pointId];
    return {
      ...r,
      point_device_ts: p?.deviceTs ?? null,
      point_lat: p?.lat ?? null,
      point_lng: p?.lng ?? null
    };
  });
}

export function listPointsForAdmin(limit = 200) {
  const db = ensureDb();
  return db
    .select({ id: points.id, deviceTs: points.deviceTs, lat: points.lat, lng: points.lng })
    .from(points)
    .orderBy(desc(points.deviceTs))
    .limit(limit)
    .all();
}

export function insertMedia(row: Omit<InsertMedia, "id" | "createdAt"> & { createdAt?: number }) {
  const db = ensureDb();
  const createdAt = row.createdAt ?? Math.floor(Date.now() / 1000);
  const r = db
    .insert(media)
    .values({
      pointId: row.pointId,
      type: row.type,
      url: row.url,
      title: row.title,
      description: row.description,
      createdAt,
      takenAt: row.takenAt ?? null,
      takenLat: row.takenLat ?? null,
      takenLng: row.takenLng ?? null
    })
    .returning()
    .get();
  return r;
}

export function updateMedia(
  id: number,
  updates: {
    title?: string;
    description?: string;
    point_id?: number;
    url?: string;
    taken_at?: number | null;
    taken_lat?: number | null;
    taken_lng?: number | null;
  }
) {
  const db = ensureDb();
  const v: Record<string, unknown> = {};
  if (updates.title !== undefined) v.title = updates.title;
  if (updates.description !== undefined) v.description = updates.description;
  if (updates.point_id !== undefined) v.pointId = updates.point_id;
  if (updates.url !== undefined) v.url = updates.url;
  if (updates.taken_at !== undefined) v.takenAt = updates.taken_at;
  if (updates.taken_lat !== undefined) v.takenLat = updates.taken_lat;
  if (updates.taken_lng !== undefined) v.takenLng = updates.taken_lng;
  if (Object.keys(v).length === 0) {
    const row = db.select().from(media).where(eq(media.id, id)).get();
    return row ?? null;
  }
  const r = db
    .update(media)
    .set(v as Record<string, string | number | null>)
    .where(eq(media.id, id))
    .returning()
    .get();
  return r ?? null;
}

export function deleteMedia(id: number): boolean {
  const db = ensureDb();
  const r = db.delete(media).where(eq(media.id, id)).run();
  return r.changes > 0;
}

export function getMediaById(id: number) {
  const db = ensureDb();
  return db.select().from(media).where(eq(media.id, id)).get() ?? null;
}

export function getPointById(id: number) {
  const db = ensureDb();
  return db.select().from(points).where(eq(points.id, id)).get() ?? null;
}

export function getConfigValue(key: string): string {
  const db = ensureDb();
  const row = db.select().from(config).where(eq(config.key, key)).get();
  return row?.value ?? "";
}

export { points, config, media };
