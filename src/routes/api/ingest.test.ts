import { describe, expect, test } from "bun:test";
import { parseDeviceTs, validatePoint } from "./ingest";

describe("parseDeviceTs", () => {
  test("returns number when valid", () => {
    expect(parseDeviceTs(1700000000000)).toBe(1700000000000);
  });

  test("parses decimal string to integer", () => {
    expect(parseDeviceTs("1700000000000")).toBe(1700000000000);
  });

  test("uses parseInt when string starts with digits", () => {
    expect(parseDeviceTs("2024-01-15T12:00:00Z")).toBe(2024);
  });

  test("falls back to Date.parse when parseInt does not apply", () => {
    const ts = Date.parse("Jan 1, 2024 12:00:00 GMT");
    expect(parseDeviceTs("Jan 1, 2024 12:00:00 GMT")).toBe(ts);
  });

  test("returns 0 for invalid or missing", () => {
    expect(parseDeviceTs(0)).toBe(0);
    expect(parseDeviceTs(NaN)).toBe(0);
    expect(parseDeviceTs("")).toBe(0);
    expect(parseDeviceTs("not-a-date")).toBe(0);
  });
});

describe("validatePoint", () => {
  test("accepts valid point", () => {
    const out = validatePoint({ lat: 45.46, lng: 9.19, device_ts: 1700000000000 });
    expect(out).toEqual({ lat: 45.46, lng: 9.19, device_ts: 1700000000000, segment_type: "ground" });
  });

  test("accepts segment_type ground, plane, boat", () => {
    expect(validatePoint({ lat: 0, lng: 0, device_ts: 1, segment_type: "plane" })?.segment_type).toBe("plane");
    expect(validatePoint({ lat: 0, lng: 0, device_ts: 1, segment_type: "boat" })?.segment_type).toBe("boat");
    expect(validatePoint({ lat: 0, lng: 0, device_ts: 1, segment_type: "ground" })?.segment_type).toBe("ground");
  });

  test("defaults invalid segment_type to ground", () => {
    expect(validatePoint({ lat: 0, lng: 0, device_ts: 1, segment_type: "train" })?.segment_type).toBe("ground");
    expect(validatePoint({ lat: 0, lng: 0, device_ts: 1 })?.segment_type).toBe("ground");
  });

  test("rejects non-object or null", () => {
    expect(validatePoint(null)).toBeNull();
    expect(validatePoint(undefined)).toBeNull();
    expect(validatePoint("")).toBeNull();
    expect(validatePoint(42)).toBeNull();
  });

  test("rejects invalid lat/lng", () => {
    expect(validatePoint({ lat: 91, lng: 0, device_ts: 1 })).toBeNull();
    expect(validatePoint({ lat: -91, lng: 0, device_ts: 1 })).toBeNull();
    expect(validatePoint({ lat: 0, lng: 181, device_ts: 1 })).toBeNull();
    expect(validatePoint({ lat: 0, lng: -181, device_ts: 1 })).toBeNull();
    expect(validatePoint({ lat: NaN, lng: 0, device_ts: 1 })).toBeNull();
    expect(validatePoint({ lat: 0, lng: "x", device_ts: 1 })).toBeNull();
  });

  test("rejects invalid or zero device_ts", () => {
    expect(validatePoint({ lat: 0, lng: 0, device_ts: 0 })).toBeNull();
    expect(validatePoint({ lat: 0, lng: 0 })).toBeNull();
  });

  test("accepts device_ts as string timestamp", () => {
    const out = validatePoint({ lat: 0, lng: 0, device_ts: "1700000000000" });
    expect(out).not.toBeNull();
    expect(out!.device_ts).toBe(1700000000000);
  });
});
