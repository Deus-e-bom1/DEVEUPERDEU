// The supplied pixel automatically captures form fields. Never load it on a regional default alone.
export const AD_CHOICE_KEY = "deveu-advertising-choice";
export const NOTICE_VERSION = "utmify-2026-10-23";
export type AdvertisingChoice = { advertising: boolean; at: string; notice: string; visitor: string; region: string; previousAcceptance?: string };
const regulated = new Set("AT BE BG HR CY CZ DK EE FI FR DE GR HU IS IE IT LV LI LT LU MT NL NO PL PT RO SK SI ES SE GB CH".split(" "));
export function permitsAdvertising(region: string, choice: AdvertisingChoice | null, optOut = false) {
  if (optOut || choice?.advertising === false) return false;
  if (!/^[A-Z]{2}$/.test(region) || region === "XX" || region === "T1") return false;
  return choice?.advertising === true || !regulated.has(region);
}
export function permitsPixel(region: string, choice: AdvertisingChoice | null, optOut = false) {
  return permitsAdvertising(region, choice, optOut) && choice?.advertising === true;
}
export function readAdvertisingChoice(): AdvertisingChoice | null {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(AD_CHOICE_KEY) || "null");
    if (!v || typeof v !== "object") return null;
    const c = v as Partial<AdvertisingChoice>;
    if (typeof c.advertising !== "boolean" || typeof c.at !== "string" || c.notice !== NOTICE_VERSION || typeof c.visitor !== "string" || typeof c.region !== "string") return null;
    return c as AdvertisingChoice;
  } catch { return null; }
}
let regionPromise: Promise<string> | undefined;
export function getAdvertisingRegion(): Promise<string> {
  return regionPromise ??= fetch("/api/advertising-region", { signal: AbortSignal.timeout(4000), cache: "no-store" })
    .then(async r => r.ok ? ((await r.json()) as { country?: string }).country ?? "XX" : "XX")
    .catch(() => "XX");
}
export function hasAdvertisingOptOut() {
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true || navigator.doNotTrack === "1";
}