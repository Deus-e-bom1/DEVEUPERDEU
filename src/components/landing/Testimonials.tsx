import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { site } from "@/config/site";
import { Img, Reveal, Rich } from "./shared";

export function Testimonials() {
  const t = site.testimonials;
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  return (
    <section className="bg-ink py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="text-center">
          <span className="eyebrow">{t.eyebrow}</span>
          <h2 className="heading mt-3 text-3xl text-primary-foreground sm:text-4xl lg:text-5xl">
            {t.titleStart} <em className="hl">{t.titleHighlight}</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-muted"><Rich text={t.text} /></p>
        </Reveal>
        <div ref={ref} className="mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
          {t.images.map((src, i) => (
            <div key={i} className="w-[70%] shrink-0 snap-start overflow-hidden rounded-2xl border-4 border-primary/70 sm:w-[44%] lg:w-[23%]">
              <Img src={src} alt={`Cliente ${i + 1}`} aspect="3/4" label={`Foto do cliente ${i + 1}`} dark />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center gap-3">
          {[-1, 1].map((d) => (
            <button key={d} onClick={() => scroll(d)} aria-label={d < 0 ? "Anterior" : "Próximo"} className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-line text-primary-foreground transition hover:bg-ink-2 active:scale-90">
              {d < 0 ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
