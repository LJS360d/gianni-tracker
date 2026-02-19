import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, inArray } from "drizzle-orm";
import { config, media, points } from "./schema";

const DB_PATH = process.env.DATABASE_PATH ?? join(process.cwd(), "data", "main.db");

let _db: ReturnType<typeof drizzle> | null = null;

function ensureDb() {
  if (_db) return _db;
  const dir = dirname(DB_PATH);
  mkdirSync(dir, { recursive: true });
  const sqlite = new Database(DB_PATH);
  _db = drizzle(sqlite);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      device_ts INTEGER NOT NULL,
      server_ts INTEGER NOT NULL,
      UNIQUE(device_ts, lat, lng)
    );
    CREATE INDEX IF NOT EXISTS idx_points_device_ts ON points(device_ts);
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      point_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_media_point_id ON media(point_id);
  `);
  const count = sqlite.prepare("SELECT COUNT(*) as c FROM config").get() as { c: number };
  if (count.c === 0) {
    sqlite.exec(
      "INSERT INTO config (key, value) VALUES ('sharing_enabled', '1'), ('public_delay_hours', '48')"
    );
  }
  return _db;
}

export function getDb() {
  return ensureDb();
}

export type PointRow = {
  id: number;
  lat: number;
  lng: number;
  device_ts: number;
  server_ts: number;
};

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

export function getMediaByPointIds(pointIds: number[]): Array<{ pointId: number; type: string; url: string; title: string; description: string }> {
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

export { points, config, media };
