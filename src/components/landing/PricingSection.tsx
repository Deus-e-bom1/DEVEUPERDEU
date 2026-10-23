import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { site, type Plan } from "@/config/site";
import { PricingCard } from "./PricingCard";
import { Reveal, Rich, SectionTitle } from "./shared";

const icons = { shield: ShieldCheck, rotate: RotateCcw, truck: Truck } as const;

/** "daily-midnight" = o contador zera à meia-noite de São Paulo; qualquer outra string é uma data ISO fixa. */
function endsAtMs(endsAt: string) {
  if (endsAt === "daily-midnight") return nextSaoPauloMidnight();
  return new Date(endsAt).getTime();
}

/** Deslocamento de São Paulo em relação ao UTC, lido do navegador (UTC-3, sem horário de verão). */
function saoPauloOffsetMs(now: number) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(now));
  const v = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0);
  const wall = Date.UTC(v("year"), v("month") - 1, v("day"), v("hour") % 24, v("minute"), v("second"));
  return wall - Math.floor(now / 1000) * 1000;
}

/** Próxima meia-noite de São Paulo, em milissegundos UTC. */
function nextSaoPauloMidnight(now = Date.now()) {
  const day = 86400000;
  const off = saoPauloOffsetMs(now);
  return Math.floor((now + off) / day) * day + day - off;
}

function Countdown({ endsAt }: { endsAt: string }) {
  const end = endsAtMs(endsAt);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (now === null || now >= end) return null;
  const s = Math.floor((end - now) / 1000);
  const parts = [[Math.floor(s / 3600), "Horas"], [Math.floor((s % 3600) / 60), "Min"], [s % 60, "Seg"]] as const;
  return (
    <div className="mx-auto mt-8 w-fit rounded-2xl border border-ink-line bg-ink-2/70 px-4 py-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-primary"><span className="h-2 w-2 rounded-full bg-destructive animate-pulse-dot" /> Oferta termina em</div>
      <div className="mt-2 flex items-start gap-1.5">
        {parts.map(([v, l], i) => (
          <div key={l} className="flex items-start gap-1.5">
            {i > 0 && <span className="mt-2 font-black text-primary">:</span>}
            <div>
              <div className="w-12 rounded-lg bg-primary py-1.5 text-2xl font-black text-primary-foreground">{String(v).padStart(2, "0")}</div>
              <div className="mt-1 text-[10px] font-bold uppercase text-ink-muted">{l}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PricingSection() {
  const p = site.pricing;
  return (
    <section id="planos" className="scroll-mt-14 bg-pricing py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <SectionTitle eyebrow={p.eyebrow} start={p.titleStart} hl={p.titleHighlight} center dark />
          <p className="mt-3 text-center text-ink-muted"><Rich text={p.subtitle} strongClass="font-bold text-primary-foreground" /></p>
          {p.promoActive && p.promoEndsAt && <Countdown endsAt={p.promoEndsAt} />}
        </Reveal>
        <div className="mx-auto mt-12 grid max-w-[1020px] items-center gap-6 lg:grid-cols-3 lg:gap-3">
          {site.plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.1}>
              <PricingCard plan={plan as Plan} promo={p.promoActive} />
            </Reveal>
          ))}
        </div>
        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-2">
          {p.guarantees.map((g) => {
            const I = icons[g.icon as keyof typeof icons];
            return (
              <div key={g.text} className="flex flex-col items-center gap-2 rounded-xl border border-ink-line bg-ink-2/60 px-2 py-3 text-center text-[11px] font-bold text-primary-foreground sm:text-xs">
                <I className="h-4 w-4 text-primary" /> {g.text}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
