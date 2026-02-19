import type { APIEvent } from "@solidjs/start/server";
import { config, getDelayHours, getDb, isSharingEnabled } from "~/lib/db";

export async function GET(_event: APIEvent) {
  const db = getDb();
  const rows = db.select().from(config).all();

  const sharing = isSharingEnabled() ? "1" : "0";
  const delay = String(getDelayHours());

  const lines = [
    `sharing_enabled=${sharing}`,
    `public_delay_hours=${delay}`,
    ...rows
      .filter(r => r.key !== "sharing_enabled" && r.key !== "public_delay_hours")
      .map(r => `${r.key}=${r.value}`)
  ];

  return new Response(lines.join("\n"), {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
