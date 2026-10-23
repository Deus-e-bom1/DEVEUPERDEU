import { Package, ShieldCheck, Truck } from "lucide-react";
import { site } from "@/config/site";
import seloVerificado from "@/assets/selo-verificado.png.asset.json";
import { Reveal, Rich } from "./shared";
import { Link } from "@tanstack/react-router";

const icons = [Package, ShieldCheck, Truck];

export function Footer() {
  const { brand, footerCard: c } = site;
  return (
    <footer className="bg-sand pb-24 sm:pb-10">
      <Reveal className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-ink px-6 py-10 text-center">
          <img src={seloVerificado.url} alt="Selo verificado" className="mx-auto h-10 w-10 object-contain" />
          <h3 className="mt-3 text-xl font-black text-primary-foreground">{c.title}</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted"><Rich text={c.text} strongClass="font-bold text-primary-foreground" /></p>
          <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-4 sm:flex-nowrap">
            {c.items.map((it, i) => { const I = icons[i % 3] ?? Package; return (
              <span key={it} className="flex flex-col items-center gap-1 text-xs font-bold text-primary-foreground"><I className="h-4 w-4 text-primary" />{it}</span>
            ); })}
          </div>
        </div>
      </Reveal>
      <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} {brand.legalName || brand.name} — Todos os direitos reservados.</p>
        {brand.cnpj && <p className="mt-1">CNPJ: {brand.cnpj}</p>}
        <a href={`mailto:${brand.email}`} className="mt-1 inline-block underline">{brand.email}</a>
        <p className="mt-3"><Link to="/privacidade" className="underline">Privacidade e escolhas de publicidade</Link></p>
      </div>
    </footer>
  );
}
