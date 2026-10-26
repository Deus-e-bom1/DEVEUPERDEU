import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { captureTrackingParams } from "@/lib/utmify";
import { AD_CHOICE_KEY, NOTICE_VERSION, getAdvertisingRegion, hasAdvertisingOptOut, permitsAdvertising, permitsPixel, readAdvertisingChoice } from "@/lib/advertising";

declare global { interface Window { pixelId?: string; fbq?: (...args: unknown[]) => void; _fbq?: (...args: unknown[]) => void } }

function startMetaPixel(id: string) {
  if (!/^\d{8,25}$/.test(id) || window.fbq) return;
  const q = function (...args: unknown[]) { (q as unknown as { callMethod?: (...args: unknown[]) => void; queue: unknown[][] }).callMethod
    ? (q as unknown as { callMethod: (...args: unknown[]) => void }).callMethod(...args)
    : (q as unknown as { queue: unknown[][] }).queue.push(args); };
  (q as unknown as { queue: unknown[][]; loaded: boolean; version: string }).queue = [];
  (q as unknown as { loaded: boolean }).loaded = true;
  (q as unknown as { version: string }).version = "2.0";
  window.fbq = q; window._fbq = q;
  const s = document.createElement("script"); s.id = "meta-pixel"; s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js"; document.head.appendChild(s);
  q("init", id); q("track", "PageView");
}

export function AdvertisingScripts() {
  const [showChoice, setShowChoice] = useState(false);
  useEffect(() => {
    // Capture attribution at the first landing, before navigating to checkout.
    captureTrackingParams();
    let active = true;
    const onChoice = (e: StorageEvent) => { if (e.key === AD_CHOICE_KEY) window.location.reload(); };
    window.addEventListener("storage", onChoice);
    void getAdvertisingRegion().then(region => {
      if (!active) return;
      const choice = readAdvertisingChoice();
      const optOut = hasAdvertisingOptOut();
      // The form-collecting UTMify Pixel and Meta Pixel require explicit opt-in.
      setShowChoice(choice === null && !optOut);
      const addScript = (id: string, src: string, attrs: Record<string, string> = {}) => {
        if (document.getElementById(id)) return;
        const s = document.createElement("script");
        s.id = id; s.src = src; s.async = true; s.defer = true;
        Object.entries(attrs).forEach(([key, value]) => s.setAttribute(key, value));
        document.head.appendChild(s);
      };
      if (permitsAdvertising(region, choice, optOut)) addScript("utmify-utms", site.tracking.utmScript, {
        "data-utmify-prevent-xcod-sck": "", "data-utmify-prevent-subids": "",
      });
      if (permitsPixel(region, choice, optOut)) {
        window.pixelId = site.tracking.pixelId;
        addScript("utmify-pixel", site.tracking.pixelScript);
        startMetaPixel(site.tracking.metaPixelId);
      }
    });
    return () => { active = false; window.removeEventListener("storage", onChoice); };
  }, []);
  const save = async (advertising: boolean) => {
    const region = await getAdvertisingRegion();
    const previous = readAdvertisingChoice();
    localStorage.setItem(AD_CHOICE_KEY, JSON.stringify({ advertising, at: new Date().toISOString(),
      notice: NOTICE_VERSION, visitor: previous?.visitor ?? crypto.randomUUID(), region }));
    window.location.reload();
  };
  if (!showChoice) return null;
  return <div className="fixed bottom-0 inset-x-0 z-[100] border-t border-border bg-background p-3 shadow-xl" role="region" aria-label="Escolhas de publicidade">
    <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
      <p className="min-w-0 flex-1 text-xs text-foreground">Usamos tecnologias de publicidade da UTMify e Meta para medir campanhas e compras. O pixel pode coletar dados do formulário. Você pode aceitar ou recusar; a compra funciona em ambos os casos. <a className="underline" href="/privacidade">Saiba mais</a>.</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => void save(false)} className="rounded-lg border border-border px-3 py-2 text-xs font-bold">Recusar</button>
        <button type="button" onClick={() => void save(true)} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Aceitar</button>
      </div>
    </div>
  </div>;
}
