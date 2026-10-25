import { MapPin } from "lucide-react";
import { site } from "@/config/site";
import { Img, Reveal, Rich } from "./shared";

export function StoreSection() {
  const s = site.store;
  return (
    <section className="bg-sand py-16 lg:py-20">
      <Reveal className="mx-auto max-w-6xl px-4">
        <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-[1.1fr_1fr]">
          <Img src={s.image} alt="Fachada da loja" aspect="3/2" label="Foto da fachada da loja" className="h-full" />
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-orange-soft px-3 py-1 text-xs font-semibold"><MapPin className="h-3.5 w-3.5 text-primary" /> {s.tag}</span>
            <h3 className="mt-3 text-xl font-black tracking-tight sm:text-2xl">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground"><Rich text={s.text} strongClass="font-bold text-foreground" /></p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground"><Rich text={s.text2} strongClass="font-bold text-foreground" /></p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
