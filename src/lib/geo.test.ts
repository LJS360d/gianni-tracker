import { describe, expect, test } from "bun:test";
import { douglasPeucker, downsampleTrack, type Point } from "./geo";

describe("douglasPeucker", () => {
  test("returns points as-is when length <= 2", () => {
    expect(douglasPeucker([], 0.1)).toEqual([]);
    expect(douglasPeucker([{ lat: 0, lng: 0, device_ts: 1 }], 0.1)).toEqual([
      { lat: 0, lng: 0, device_ts: 1 }
    ]);
    expect(
      douglasPeucker(
        [
          { lat: 0, lng: 0, device_ts: 1 },
          { lat: 1, lng: 1, device_ts: 2 }
        ],
        0.1
      )
    ).toEqual([
      { lat: 0, lng: 0, device_ts: 1 },
      { lat: 1, lng: 1, device_ts: 2 }
    ]);
  });

  test("collapses to endpoints when all midpoints within epsilon", () => {
    const pts: Point[] = [
      { lat: 0, lng: 0, device_ts: 1 },
      { lat: 0.5, lng: 0.5, device_ts: 2 },
      { lat: 1, lng: 1, device_ts: 3 }
    ];
    const out = douglasPeucker(pts, 1);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual(pts[0]);
    expect(out[1]).toEqual(pts[pts.length - 1]);
  });

  test("keeps point when deviation exceeds epsilon", () => {
    const pts: Point[] = [
      { lat: 0, lng: 0, device_ts: 1 },
      { lat: 0.5, lng: 1.5, device_ts: 2 },
      { lat: 1, lng: 0, device_ts: 3 }
    ];
    const out = douglasPeucker(pts, 0.01);
    expect(out.length).toBeGreaterThanOrEqual(2);
    expect(out[0]).toEqual(pts[0]);
    expect(out[out.length - 1]).toEqual(pts[pts.length - 1]);
  });
});

describe("downsampleTrack", () => {
  test("returns all points when count <= maxPoints", () => {
    const pts: Point[] = [
      { lat: 0, lng: 0, device_ts: 1 },
      { lat: 1, lng: 1, device_ts: 2 }
    ];
    expect(downsampleTrack(pts, 500)).toEqual(pts);
    expect(downsampleTrack(pts)).toEqual(pts);
  });

  test("returns at most maxPoints", () => {
    const pts: Point[] = Array.from({ length: 1000 }, (_, i) => ({
      lat: i * 0.001,
      lng: i * 0.001,
      device_ts: i
    }));
    const out = downsampleTrack(pts, 100);
    expect(out.length).toBeLessThanOrEqual(100);
    expect(out[0]).toEqual(pts[0]);
    expect(out[out.length - 1]).toEqual(pts[pts.length - 1]);
  });
});
