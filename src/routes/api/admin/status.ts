import type { APIEvent } from "@solidjs/start/server";
import { checkAdmin, jsonResponse, unauthorized } from "~/lib/admin-auth";
import { getLastSyncServerTs } from "~/lib/db";

export async function GET(event: APIEvent) {
  if (!checkAdmin(event.request)) return unauthorized();
  const lastSync = getLastSyncServerTs();
  return jsonResponse({ last_sync_server_ts: lastSync });
}
