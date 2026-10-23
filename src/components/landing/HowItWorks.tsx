import { site } from "@/config/site";
import { Img, Reveal, Rich } from "./shared";
import { ProductBrands } from "./ProductBrands";

export function HowItWorks() {
  const h = site.howItWorks;
  return (
    <section className="bg-sand pb-16 lg:pb-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="text-center">
          <span className="eyebrow">{h.eyebrow}</span>
          <h2 className="heading mx-auto mt-3 max-w-3xl text-3xl sm:text-4xl lg:text-5xl">
            {h.titleA} <em className="hl">{h.hlA}</em>. <br className="hidden sm:block" />
            {h.titleB} <em className="hl">{h.hlB}</em>.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <Reveal className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Img src={h.image} alt="Estoque da loja" aspect="16/9" label="Foto do estoque / loja" />
            <div className="p-5 sm:p-6">
              <h3 className="text-lg font-black tracking-tight">{h.boxTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground"><Rich text={h.boxText} strongClass="font-bold text-foreground" /></p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {h.weights.map((w) => (
                  <div key={w.kg} className="rounded-xl border border-border bg-muted py-2.5 text-center transition hover:-translate-y-0.5 hover:border-primary">
                    <div className="font-black">{w.kg}</div>
                    <div className="text-[11px] text-muted-foreground">{w.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="px-1 pb-4">
              <h3 className="text-lg font-black tracking-tight">{h.originTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground"><Rich text={h.originText} strongClass="font-bold text-foreground" /></p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground"><Rich text={h.originText2} strongClass="font-bold text-foreground" /></p>
            </div>
            <ProductBrands />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
