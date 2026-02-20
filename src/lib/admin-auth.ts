const ADMIN_TOKEN = process.env.ADMIN_ACCESS_TOKEN ?? "";

export function checkAdmin(request: Request): boolean {
  if (!ADMIN_TOKEN) return true;
  return request.headers.get("Authorization") === `Bearer ${ADMIN_TOKEN}`;
}

export function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" }
  });
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
