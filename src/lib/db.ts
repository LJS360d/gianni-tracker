import {
  db,
  config,
  media,
  points,
  eq,
  desc,
  asc,
  inArray,
  sql,
} from "astro:db";

export type MediaSortColumn = "id" | "created_at" | "taken_at" | "title";
export type ListMediaFilters = {
  point_id?: number;
  limit?: number;
  offset?: number;
  sort?: MediaSortColumn;
  order?: "asc" | "desc";
};

// CONFIG HELPERS
export async function getDelayHours(): Promise<number> {
  const [row] = await db
    .select()
    .from(config)
    .where(eq(config.key, "public_delay_hours"));
  const n = row ? parseInt(row.value, 10) : 48;
  return Number.isFinite(n) ? n : 48;
}

export async function isSharingEnabled(): Promise<boolean> {
  const [row] = await db
    .select()
    .from(config)
    .where(eq(config.key, "sharing_enabled"));
  return row?.value === "1";
}

export async function setConfig(key: string, value: string) {
  // Astro DB uses upsert via onConflictDoUpdate
  await db.insert(config).values({ key, value }).onConflictDoUpdate({
    target: config.key,
    set: { value },
  });
}

// POINT HELPERS
export async function getLastSyncServerTs(): Promise<number | null> {
  const [row] = await db
    .select({ serverTs: points.serverTs })
    .from(points)
    .orderBy(desc(points.serverTs))
    .limit(1);
  return row?.serverTs ?? null;
}

export async function getMediaByPointIds(pointIds: number[]) {
  if (pointIds.length === 0) return [];
  return await db
    .select({
      pointId: media.pointId,
      type: media.type,
      url: media.url,
      title: media.title,
      description: media.description,
    })
    .from(media)
    .where(inArray(media.pointId, pointIds));
}

// MEDIA LISTING & COUNTING
export async function countMedia(
  filters: Omit<ListMediaFilters, "limit" | "offset" | "sort" | "order"> = {},
) {
  let query = db
    .select({ count: sql<number>`count(*)` })
    .from(media)
    .$dynamic();
  if (filters.point_id != null)
    query = query.where(eq(media.pointId, filters.point_id));

  const [row] = await query;
  return Number(row?.count ?? 0);
}

export async function listMedia(filters: ListMediaFilters = {}) {
  const {
    point_id,
    limit = 100,
    offset = 0,
    sort = "created_at",
    order = "desc",
  } = filters;

  let query = db.select().from(media).$dynamic();

  if (point_id != null) query = query.where(eq(media.pointId, point_id));

  const orderByCol =
    sort === "id"
      ? media.id
      : sort === "title"
        ? media.title
        : sort === "taken_at"
          ? media.takenAt
          : media.createdAt;

  const ordered =
    order === "asc"
      ? query.orderBy(asc(orderByCol))
      : query.orderBy(desc(orderByCol));
  return await ordered.limit(limit).offset(offset);
}

// MUTATIONS
export async function insertMedia(row: any) {
  const createdAt = row.createdAt ?? Math.floor(Date.now() / 1000);
  const [inserted] = await db
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
      takenLng: row.takenLng ?? null,
    })
    .returning();
  return inserted;
}

export async function deleteMedia(id: number): Promise<boolean> {
  const result = await db.delete(media).where(eq(media.id, id));
  return !!result.rowsAffected;
}

export async function getMediaById(id: number) {
  const [row] = await db.select().from(media).where(eq(media.id, id));
  return row ?? null;
}
