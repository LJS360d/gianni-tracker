import { defineDb, defineTable, column } from "astro:db";

const points = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    lat: column.number(),
    lng: column.number(),
    deviceTs: column.number(),
    serverTs: column.number(),
    segmentType: column.text({ default: "ground" }), // "ground" | "plane" | "boat"
  },
  indexes: [{ on: ["deviceTs", "lat", "lng"], unique: true }],
});

const media = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    pointId: column.number({ references: () => points.columns.id }),
    type: column.text(), // "image" | "video"
    url: column.text(),
    title: column.text(),
    description: column.text(),
    createdAt: column.number({ default: 0 }),
    takenAt: column.number({ optional: true }),
    takenLat: column.number({ optional: true }),
    takenLng: column.number({ optional: true }),
  },
});

const config = defineTable({
  columns: {
    key: column.text({ primaryKey: true }),
    value: column.text(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    points,
    media,
    config,
  },
});
