import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { site } from "@/config/site";

/** Barra fixa no celular: aparece após o topo e some quando os planos estão visíveis. */
export function StickyCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const plans = document.getElementById("planos")?.getBoundingClientRect();
      const inPlans = plans ? plans.top < window.innerHeight && plans.bottom > 0 : false;
      setShow(window.scrollY > 600 && !inPlans);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const min = Math.min(...site.plans.map((p) => p.price)).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed inset-x-0 bottom-0 z-50 border-t border-ink-line bg-ink/95 p-3 backdrop-blur sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-ink-muted">Caixas a partir de <strong className="text-primary-foreground">R$ {min}</strong></span>
            <a href="#planos" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow active:scale-95">Escolher caixa</a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
