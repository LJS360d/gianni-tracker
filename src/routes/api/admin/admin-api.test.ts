import { beforeAll, describe, expect, test } from "bun:test";

process.env.ADMIN_ACCESS_TOKEN = "test-admin-token";
process.env.FAMILY_ACCESS_TOKEN = "test-family-token";
process.env.FAMILY_DELAY_HOURS = "12";

function mockEvent(request: Request): { request: Request } {
  return { request };
}

describe("GET /api/admin/config", () => {
  let GET: (event: { request: Request }) => Promise<Response>;
  beforeAll(async () => {
    const m = await import("./config");
    GET = m.GET;
  });

  test("returns 401 without token when ADMIN_ACCESS_TOKEN is set", async () => {
    const res = await GET(mockEvent(new Request("http://x/api/admin/config")));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  test("returns 401 with wrong Bearer token", async () => {
    const res = await GET(
      mockEvent(
        new Request("http://x/api/admin/config", {
          headers: { Authorization: "Bearer wrong-token" }
        })
      )
    );
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/admin/config", () => {
  let PATCH: (event: { request: Request }) => Promise<Response>;
  beforeAll(async () => {
    const m = await import("./config");
    PATCH = m.PATCH;
  });

  test("returns 401 without token when ADMIN_ACCESS_TOKEN is set", async () => {
    const res = await PATCH(
      mockEvent(
        new Request("http://x", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delay_hours: 24 })
        })
      )
    );
    expect(res.status).toBe(401);
  });

  test("returns 400 for invalid JSON", async () => {
    const res = await PATCH(
      mockEvent(
        new Request("http://x", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-admin-token"
          },
          body: "not json"
        })
      )
    );
    expect(res.status).toBe(400);
  });
});

describe("GET /api/admin/status", () => {
  let GET: (event: { request: Request }) => Promise<Response>;
  beforeAll(async () => {
    const m = await import("./status");
    GET = m.GET;
  });

  test("returns 401 without token when ADMIN_ACCESS_TOKEN is set", async () => {
    const res = await GET(mockEvent(new Request("http://x/api/admin/status")));
    expect(res.status).toBe(401);
  });
});
