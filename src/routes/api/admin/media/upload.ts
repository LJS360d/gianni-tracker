import type { APIEvent } from "@solidjs/start/server";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import exifr from "exifr";
import { checkAdmin, jsonResponse, unauthorized } from "~/lib/admin-auth";

const MEDIA_DIR = process.env.UPLOAD_DIR ?? join(process.cwd(), "public", "media");

async function extractExif(filePath: string): Promise<{ taken_at?: number; taken_lat?: number; taken_lng?: number }> {
  try {
    const exif = await exifr.parse(filePath, { pick: ["DateTimeOriginal", "latitude", "longitude"] });
    if (!exif) return {};
    const out: { taken_at?: number; taken_lat?: number; taken_lng?: number } = {};
    if (exif.DateTimeOriginal instanceof Date) out.taken_at = Math.floor(new Date(exif.DateTimeOriginal).getTime() / 1000);
    if (typeof exif.latitude === "number" && typeof exif.longitude === "number") {
      out.taken_lat = exif.latitude;
      out.taken_lng = exif.longitude;
    }
    return out;
  } catch {
    return {};
  }
}

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov"
  };
  return map[mime] ?? ".bin";
}

function safeName(original: string): string {
  return original.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "file";
}

export async function POST(event: APIEvent) {
  if (!checkAdmin(event.request)) return unauthorized();
  let formData: FormData;
  try {
    formData = await event.request.formData();
  } catch {
    return jsonResponse({ error: "Invalid form" }, 400);
  }
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return jsonResponse({ error: "Missing file" }, 400);
  }
  let ext = extFromMime(file.type);
  if (ext === ".bin" && file.name.includes(".")) {
    const match = file.name.match(/\.[a-zA-Z0-9]+$/);
    if (match) ext = match[0].toLowerCase();
  }
  const base = `${Date.now()}-${safeName(file.name).replace(/\.[^.]+$/, "")}`.slice(0, 60);
  const filename = `${base}${ext}`;
  mkdirSync(MEDIA_DIR, { recursive: true });
  const path = join(MEDIA_DIR, filename);
  const buf = await file.arrayBuffer();
  writeFileSync(path, Buffer.from(buf));
  const exif = await extractExif(path);
  return jsonResponse({ url: `/media/${filename}`, ...exif });
}
