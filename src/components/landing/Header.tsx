import { Lock } from "lucide-react";
import { site } from "@/config/site";
import { Rich } from "./shared";

export function Header() {
  const { brand } = site;
  return (
    <>
      <div className="bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground sm:text-sm">
        <Rich text={site.topBar} />
      </div>
      <header className="sticky top-0 z-40 border-b border-ink-line bg-ink/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-[60px]">
          <a href="#" className="flex items-center" aria-label={brand.name}>
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} className="h-9 w-auto" />
            ) : (
              <span className="text-base font-black uppercase leading-none tracking-tight text-primary-foreground">{brand.name}</span>
            )}
          </a>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
              {site.headerBadgeIcon ? (
                <img src={site.headerBadgeIcon} alt="" className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3.5 w-3.5 text-success" />
              )}{" "}
              {site.headerBadge}
            </span>
            <a href="#planos" className="hidden rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition hover:brightness-110 active:scale-95 sm:inline-block">
              {site.headerCta}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
