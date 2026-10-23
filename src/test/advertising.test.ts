import { describe, expect, it } from "vitest";
import { permitsAdvertising, permitsPixel, type AdvertisingChoice } from "@/lib/advertising";
const accepted: AdvertisingChoice = { advertising: true, at: "2026-10-23T20:03:00Z", notice: "utmify-2026-10-23", visitor: "visitor-test", region: "BR" };
describe("UTMify no-banner permission", () => {
  it("blocks regulated and unresolved regions without acceptance", () => {
    for (const region of ["DE", "PT", "GB", "XX", "T1", ""]) expect(permitsAdvertising(region, null)).toBe(false);
    expect(permitsAdvertising("BR", null)).toBe(true);
  });
  it("always respects refusal and privacy opt-outs", () => {
    expect(permitsAdvertising("BR", { ...accepted, advertising: false })).toBe(false);
    expect(permitsAdvertising("BR", accepted, true)).toBe(false);
  });
  it("requires explicit acceptance for the form-collecting pixel", () => {
    expect(permitsPixel("BR", null)).toBe(false);
    expect(permitsPixel("BR", accepted)).toBe(true);
    expect(permitsPixel("DE", { ...accepted, advertising: false })).toBe(false);
  });
});