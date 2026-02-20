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
    segmentType: text("segment_type", { enum: segmentTypes }).notNull().default("ground")
  },
  (t) => [unique().on(t.deviceTs, t.lat, t.lng)]
);

export const mediaTypes = ["image", "video"] as const;
export type MediaType = (typeof mediaTypes)[number];

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pointId: integer("point_id").notNull(),
  type: text("type", { enum: mediaTypes }).notNull(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: integer("created_at").notNull().default(0),
  takenAt: integer("taken_at"),
  takenLat: real("taken_lat"),
  takenLng: real("taken_lng")
});

export const config = sqliteTable("config", {
  key: text("key").primaryKey(),
  value: text("value").notNull()
});

export type Point = (typeof points)["$inferSelect"];
export type InsertPoint = (typeof points)["$inferInsert"];
export type Media = (typeof media)["$inferSelect"];
export type InsertMedia = (typeof media)["$inferInsert"];
