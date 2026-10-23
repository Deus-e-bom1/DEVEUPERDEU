import { useState } from "react";
import { Gift, Star, Tag, Zap } from "lucide-react";
import { site } from "@/config/site";

export type Prize = (typeof site.checkout.roulette.prizes)[number];

// 8 fatias: cada prêmio aparece duas vezes, alternando cores como na referência
const SLICE_COLORS = ["var(--primary)", "var(--ink)", "var(--orange-soft)", "var(--ink-2)"];
const TEXT_COLORS = ["var(--primary-foreground)", "var(--primary-foreground)", "var(--foreground)", "var(--primary-foreground)"];
const icons = { shipping: Zap, upgrade: Star, discount: Tag, gift: Gift } as const;

function pick(prizes: Prize[]) {
  const total = prizes.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of prizes) { if ((r -= p.weight) < 0) return p; }
  return prizes[0]!;
}

export function RouletteModal({ onRedeem }: { onRedeem: (p: Prize) => void }) {
  const { prizes, teaser } = site.checkout.roulette;
  const slices = [...prizes, ...prizes];
  const n = slices.length;
  const deg = 360 / n;
  const [rot, setRot] = useState(0);
  const [phase, setPhase] = useState<"idle" | "spin" | "won">("idle");
  const [won, setWon] = useState<Prize | null>(null);

  const spin = () => {
    const p = pick(prizes);
    const idxs = slices.map((s, i) => (s.id === p.id ? i : -1)).filter((i) => i >= 0);
    const idx = idxs[Math.floor(Math.random() * idxs.length)]!;
    // ponteiro no topo; centro da fatia idx está em idx*deg + deg/2
    setRot(360 * 6 + (360 - (idx * deg + deg / 2)));
    setPhase("spin");
    setTimeout(() => { setWon(p); setPhase("won"); }, 4200);
  };

  const gradient = `conic-gradient(${slices.map((_, i) => `${SLICE_COLORS[i % 4]} ${i * deg}deg ${(i + 1) * deg}deg`).join(",")})`;
  const Icon = won ? icons[won.kind as keyof typeof icons] ?? Gift : Gift;

  const Teaser = (
    <div className="mt-4">
      <p className="text-center text-sm font-black">Sua caixa pode conter:</p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {teaser.map((t) => (
          <div key={t.name} className="relative aspect-square overflow-hidden rounded-xl border-2 border-primary/40 bg-ink">
            <img src={t.image} alt="" className="h-full w-full scale-125 object-cover opacity-60 blur-md" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground">
              <span className="text-xl font-black">?</span>
              <span className="text-[10px] font-black uppercase">{t.name}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">Conteúdo aleatório — revelado quando você abrir a caixa.</p>
    </div>
  );

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-3 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-card p-5 shadow-2xl">
        {phase !== "won" ? (
          <>
            <p className="text-center text-xs font-black uppercase tracking-[0.16em] text-primary">Bônus exclusivo</p>
            <h2 className="mt-1 text-center text-2xl font-black tracking-tight">Gire a roleta e ganhe um bônus</h2>
            <p className="mt-1 text-center text-sm text-muted-foreground">Todo giro é premiado. O bônus é aplicado automaticamente no seu pedido.</p>
            <div className="relative mx-auto mt-4 aspect-square w-full max-w-[290px]">
              <div className="absolute left-1/2 top-[-6px] z-10 h-0 w-0 -translate-x-1/2 border-x-[12px] border-t-[18px] border-x-transparent border-t-ink" />
              <div
                className="h-full w-full rounded-full border-[6px] border-primary shadow-xl"
                style={{ background: gradient, transform: `rotate(${rot}deg)`, transition: phase === "spin" ? "transform 4s cubic-bezier(0.17,0.67,0.12,1)" : "none" }}
              >
                {slices.map((s, i) => (
                  <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * deg + deg / 2}deg)` }}>
                    <span className="absolute left-1/2 top-[5%] text-center text-[10px] font-black uppercase leading-tight" style={{ color: TEXT_COLORS[i % 4], writingMode: "vertical-rl", transform: "translateX(-50%) rotate(180deg)", height: "34%" }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-card bg-ink text-xs font-black text-primary-foreground">BÔNUS</div>
            </div>
            {phase === "spin" && Teaser}
            <button type="button" disabled={phase === "spin"} onClick={spin} className="mt-4 h-14 w-full rounded-xl bg-primary text-lg font-black uppercase text-primary-foreground shadow-glow transition active:scale-[.98] disabled:opacity-60">
              {phase === "spin" ? "Girando..." : "Girar roleta"}
            </button>
          </>
        ) : (
          <>
            <p className="text-center text-xs font-black uppercase tracking-[0.16em] text-primary">Parabéns!</p>
            <h2 className="mt-1 text-center text-2xl font-black tracking-tight">Seu bônus foi liberado</h2>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary/30 bg-orange-soft p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Icon className="h-6 w-6" fill="currentColor" /></span>
              <span><span className="block font-black">{won!.title}</span><span className="block text-sm text-muted-foreground">{won!.text}</span></span>
            </div>
            {Teaser}
            <button type="button" onClick={() => onRedeem(won!)} className="mt-4 h-14 w-full rounded-xl bg-primary text-lg font-black uppercase text-primary-foreground shadow-glow transition active:scale-[.98]">
              Resgatar e gerar PIX
            </button>
          </>
        )}
      </div>
    </div>
  );
}
