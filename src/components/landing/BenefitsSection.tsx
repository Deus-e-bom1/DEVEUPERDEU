import { Check } from "lucide-react";
import { site } from "@/config/site";
import { Reveal, SectionTitle } from "./shared";
import { VSLPlayer } from "./VSLPlayer";

export function BenefitsSection() {
  const v = site.vsl;
  return (
    <section className="bg-sand py-14 lg:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-[360px_1fr] lg:gap-14">
        <Reveal className="mx-auto w-full max-w-[360px]">
          <VSLPlayer type={v.type} src={v.src} playerId={v.playerId} poster={v.poster} aspect={v.aspect} />
        </Reveal>
        <Reveal delay={0.1}>
          <SectionTitle eyebrow={v.eyebrow} start={v.titleStart} hl={v.titleHighlight} end={v.titleEnd} />
          <p className="mt-4 max-w-lg text-muted-foreground">{v.description}</p>
          <ul className="mt-6 space-y-3">
            {v.benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 font-semibold">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="h-3.5 w-3.5" /></span>
                {b}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
