import { sqliteTable, text, real, integer, unique } from "drizzle-orm/sqlite-core";

export const segmentTypes = ["ground", "plane", "boat"] as const;
export type SegmentType = (typeof segmentTypes)[number];

export const points = sqliteTable(
  "points",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    deviceTs: integer("device_ts").notNull(),
    serverTs: integer("server_ts").notNull(),
    segmentType: text("segment_type").notNull().default("ground")
  },
  (t) => [unique().on(t.deviceTs, t.lat, t.lng)]
);

export const mediaProviders = ["youtube", "imgur", "local"] as const;
export type MediaProvider = (typeof mediaProviders)[number];

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pointId: integer("point_id").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  provider: text("provider")
});

export const config = sqliteTable("config", {
  key: text("key").primaryKey(),
  value: text("value").notNull()
});
