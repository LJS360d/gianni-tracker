import type { APIEvent } from "@solidjs/start/server";
import { getLastSyncServerTs } from "~/lib/db";

const ADMIN_TOKEN = process.env.ADMIN_ACCESS_TOKEN ?? "";

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
}

export async function GET(event: APIEvent) {
  if (ADMIN_TOKEN && event.request.headers.get("Authorization") !== `Bearer ${ADMIN_TOKEN}`) {
    return unauthorized();
  }
  const lastSync = getLastSyncServerTs();
  return new Response(
    JSON.stringify({ last_sync_server_ts: lastSync }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
