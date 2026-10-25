import { useEffect } from "react";
import { site } from "@/config/site";
import { AD_CHOICE_KEY, getAdvertisingRegion, hasAdvertisingOptOut, permitsAdvertising, permitsPixel, readAdvertisingChoice } from "@/lib/advertising";

declare global { interface Window { pixelId?: string } }

export function AdvertisingScripts() {
  useEffect(() => {
    let active = true;
    const onChoice = (e: StorageEvent) => {
      if (e.key === AD_CHOICE_KEY) window.location.reload();
    };
    window.addEventListener("storage", onChoice);
    void getAdvertisingRegion().then(region => {
      if (!active) return;
      const choice = readAdvertisingChoice();
      const optOut = hasAdvertisingOptOut();
      const addScript = (id: string, src: string, attrs: Record<string, string> = {}) => {
        if (document.getElementById(id)) return;
        const s = document.createElement("script");
        s.id = id; s.src = src; s.async = true; s.defer = true;
        Object.entries(attrs).forEach(([key, value]) => s.setAttribute(key, value));
        document.head.appendChild(s);
      };
      if (permitsAdvertising(region, choice, optOut)) addScript("utmify-utms", site.tracking.utmScript, { "data-utmify-prevent-xcod-sck": "", "data-utmify-prevent-subids": "" });
      if (permitsPixel(region, choice, optOut)) {
        window.pixelId = site.tracking.pixelId;
        addScript("utmify-pixel", site.tracking.pixelScript);
      }
    });
    return () => { active = false; window.removeEventListener("storage", onChoice); };
  }, []);
  return null;
}