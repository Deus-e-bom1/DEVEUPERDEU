import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Renderiza **negrito** a partir de texto da configuração. */
export function Rich({ text, strongClass = "font-bold text-current" }: { text: string; strongClass?: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <strong key={i} className={strongClass}>{p}</strong> : p))}
    </>
  );
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Imagem configurável; sem src mostra um placeholder identificado na proporção correta. */
export function Img({ src, alt, aspect, className = "", label, dark }: { src?: string | null; alt: string; aspect: string; className?: string; label: string; dark?: boolean }) {
  if (src) return <img src={src} alt={alt} loading="lazy" className={`w-full object-cover ${className}`} style={{ aspectRatio: aspect }} />;
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={`flex w-full flex-col items-center justify-center gap-2 border-2 border-dashed p-4 text-center text-xs font-semibold ${dark ? "border-ink-line bg-ink-2 text-ink-muted" : "border-border bg-muted text-muted-foreground"} ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <ImageIcon className="h-6 w-6 opacity-60" />
      <span>{label}</span>
      <span className="font-normal opacity-70">{aspect.replace("/", ":")}</span>
    </div>
  );
}

export function SectionTitle({ eyebrow, start, hl, end, center, dark }: { eyebrow: string; start: string; hl: string; end?: string; center?: boolean; dark?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className={`heading mt-3 text-3xl sm:text-4xl lg:text-5xl ${dark ? "text-primary-foreground" : "text-foreground"}`}>
        {start} <em className="hl">{hl}</em>
        {end ? <> {end}</> : null}
      </h2>
    </div>
  );
}

export const brl = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
