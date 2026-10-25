import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { site } from "@/config/site";
import { Reveal } from "./shared";

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="bg-sand py-16 lg:py-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
        <Reveal>
          <span className="eyebrow">Dúvidas frequentes</span>
          <h2 className="heading mt-3 text-3xl sm:text-4xl">Tudo o que você precisa saber</h2>
          <p className="mt-4 text-muted-foreground">
            Não encontrou sua resposta? Fale com a gente em <strong className="font-bold text-foreground">{site.brand.email}</strong> — respondemos em até 24 horas.
          </p>
        </Reveal>
        <div className="space-y-2.5">
          {site.faq.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="overflow-hidden rounded-xl border border-border bg-card">
                <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-bold sm:text-[15px]">
                  {f.q}
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}><Plus className="h-3 w-3" /></span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
