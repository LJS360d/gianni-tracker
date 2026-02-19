import type { APIEvent } from "@solidjs/start/server";
import { getDelayHours, isSharingEnabled, setConfig } from "~/lib/db";

const ADMIN_TOKEN = process.env.ADMIN_ACCESS_TOKEN ?? "";

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
}

function checkAdmin(request: Request): boolean {
  if (!ADMIN_TOKEN) return true;
  return request.headers.get("Authorization") === `Bearer ${ADMIN_TOKEN}`;
}

export async function GET(event: APIEvent) {
  if (!checkAdmin(event.request)) return unauthorized();
  const delayHours = getDelayHours();
  const sharingEnabled = isSharingEnabled();
  return new Response(
    JSON.stringify({ delay_hours: delayHours, sharing_enabled: sharingEnabled }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function PATCH(event: APIEvent) {
  if (!checkAdmin(event.request)) return unauthorized();
  let body: { delay_hours?: number; sharing_enabled?: boolean };
  try {
    body = await event.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (typeof body.delay_hours === "number" && body.delay_hours >= 0) {
    const hours = Math.min(168, Math.round(body.delay_hours));
    setConfig("public_delay_hours", String(hours));
  }
  if (typeof body.sharing_enabled === "boolean") {
    setConfig("sharing_enabled", body.sharing_enabled ? "1" : "0");
  }
  const delayHours = getDelayHours();
  const sharingEnabled = isSharingEnabled();
  return new Response(
    JSON.stringify({ delay_hours: delayHours, sharing_enabled: sharingEnabled }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
