import { motion } from "framer-motion";
import { ArrowRight, Check, Lock, ShieldCheck, Zap } from "lucide-react";
import { site } from "@/config/site";
import { Rich } from "./shared";

const icons = { shield: ShieldCheck, lock: Lock, zap: Zap } as const;

export function HeroSection() {
  const h = site.hero;
  return (
    <>
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-12 pt-10 lg:grid-cols-2 lg:gap-6 lg:pb-16 lg:pt-14">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            {h.badge && (
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink-line bg-ink-2 px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse-dot" /> {h.badge}
              </span>
            )}
            <h1 className="heading text-[2.6rem] text-primary-foreground sm:text-5xl lg:text-[3.5rem]">
              {h.titleStart} <span className="hl">{h.titleHighlight}</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
              <Rich text={h.subtitle} strongClass="font-bold text-primary-foreground" />
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a href="#planos" className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[15px] font-bold text-primary-foreground shadow-glow transition hover:-translate-y-0.5 hover:brightness-110 active:scale-95">
                {h.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
              <span className="flex items-center gap-1.5 text-xs text-ink-muted"><Check className="h-3.5 w-3.5 text-success" /> {h.ctaNote}</span>
            </div>
            <div className="mt-6 grid max-w-lg grid-cols-3 gap-2">
              {h.stats.map((s) => (
                <div key={s.value} className="rounded-xl border border-ink-line bg-ink-2/60 px-2 py-3 text-center">
                  <div className="text-sm font-black text-primary-foreground sm:text-lg">{s.value}</div>
                  <div className="text-[11px] text-ink-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="relative">
            <div className="absolute inset-[15%] rounded-full bg-primary/30 blur-3xl" />
            <img src={h.image} alt="Produtos que podem vir na caixa surpresa" width={1000} height={951} className="relative mx-auto w-full max-w-md drop-shadow-2xl lg:max-w-full" />
          </motion.div>
        </div>
        {h.marketplaces.map((m, i) => (
          <motion.div
            key={m.name}
            aria-hidden
            initial={{ opacity: 0, x: m.side === "left" ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 + i * 0.12 }}
            className={`pointer-events-none absolute top-[var(--mt)] lg:top-[var(--dt)] ${m.side === "left" ? "-left-7 lg:-left-6" : "-right-7 lg:-right-6"}`}
            style={{ ["--dt" as string]: m.top, ["--mt" as string]: m.side === "left" ? (i % 2 ? "88%" : "68%") : (i % 2 ? "86%" : "64%") }}
          >
            <div
              className="animate-float flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl shadow-2xl sm:h-20 sm:w-20 lg:h-24 lg:w-24"
              style={{ ["--r" as string]: `${m.rotate}deg`, animationDelay: `${i * 0.7}s` }}
            >
              {m.logo ? (
                <img src={m.logo} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="px-1 text-center text-[10px] font-black leading-tight text-muted-foreground">{m.name}</span>
              )}
            </div>
          </motion.div>
        ))}
      </section>
      <div className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2 px-4 py-4 sm:py-5">
          {site.trustBar.map((t) => {
            const I = icons[t.icon as keyof typeof icons];
            return (
              <div key={t.title} className="flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-center sm:gap-3 sm:text-left">
                <I className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                <div>
                  <div className="text-xs font-bold sm:text-sm">{t.title}</div>
                  <div className="text-[11px] text-muted-foreground sm:text-xs">{t.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
