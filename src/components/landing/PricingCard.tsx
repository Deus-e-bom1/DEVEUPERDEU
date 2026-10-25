import { ArrowRight, Check, Star, Truck } from "lucide-react";

import type { Plan } from "@/config/site";
import { brl } from "./shared";

export function PricingCard({ plan, promo }: { plan: Plan; promo: boolean }) {

  const f = plan.featured;
  const [int, cents] = brl(plan.price).split(",");
  const showOld = promo && plan.oldPrice && plan.oldPrice > plan.price;
  const off = showOld ? Math.round((1 - plan.price / plan.oldPrice!) * 100) : 0;

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-card ${f ? "z-10 border-4 border-primary shadow-featured lg:-my-8" : "shadow-xl"}`}>
      {f && (
        <div className="flex items-center justify-center gap-1.5 bg-primary py-2 text-xs font-black uppercase tracking-[0.14em] text-primary-foreground">
          <Star className="h-3.5 w-3.5" fill="currentColor" /> {plan.featuredLabel}
        </div>
      )}
      <div className="relative bg-card-top px-4 pt-4">
        {showOld && <span className="absolute left-4 top-4 rounded-lg bg-destructive px-2 py-1 text-xs font-black text-destructive-foreground">-{off}%</span>}
        <span className="absolute right-4 top-4 rounded-full bg-ink px-2.5 py-1 text-xs font-black text-primary-foreground">{plan.weight}</span>
        <img src={plan.image} alt={plan.name} loading="lazy" className="mx-auto h-44 w-auto object-contain transition duration-500 hover:scale-105" />
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>
        <p className="text-sm text-muted-foreground">{plan.tagline}</p>
        <ul className="mt-4 space-y-2.5">
          {plan.benefits.map((b) => (
            <li key={b} className="flex items-center gap-2.5 text-sm font-medium">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-ink"><Check className="h-3 w-3" /></span>{b}
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-dashed border-border pt-4">
          {showOld && <div className="text-sm text-muted-foreground">de <s className="font-semibold">R$ {brl(plan.oldPrice!)}</s> por</div>}
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="flex items-start font-black tracking-tighter">
                <span className="mt-2 text-base">R$</span>
                <span className="text-5xl leading-none">{int}</span>
                <span className="self-end text-xl">,{cents}</span>
              </div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">à vista no Pix</div>
            </div>
            {showOld && (
              <div className="rounded-xl bg-success-soft px-3 py-1.5 text-center text-success-ink">
                <div className="text-[11px] font-bold">Você economiza</div>
                <div className="font-black">R$ {brl(plan.oldPrice! - plan.price)}</div>
              </div>
            )}
          </div>
        </div>
        <a
          href={plan.checkout || `/checkout?plano=${plan.id}`}
          className={`mt-5 flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-black transition hover:-translate-y-0.5 active:scale-95 ${f ? "bg-primary text-primary-foreground shadow-glow" : "bg-ink text-primary-foreground hover:bg-ink-2"}`}
        >
          {plan.cta} <ArrowRight className="h-4 w-4" />
        </a>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><Truck className="h-3.5 w-3.5 text-success-ink" /> Frete grátis para todo o Brasil</p>
      </div>
    </div>
  );
}
