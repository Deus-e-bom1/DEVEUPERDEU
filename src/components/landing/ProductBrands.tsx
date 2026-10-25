import { site } from "@/config/site";
import { Img } from "./shared";

export function ProductBrands() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {site.brands.map((b) => (
        <div key={b.name} className="rounded-xl border border-border bg-card p-3 transition hover:-translate-y-1 hover:shadow-lg">
          <div className="text-[11px] font-black text-primary">{b.rank}</div>
          <div className="text-sm font-black">{b.name}</div>
          <Img src={b.image} alt={`Produtos ${b.name}`} aspect="4/3" label={`Produtos ${b.name}`} className="mt-2 rounded-lg !object-contain" />
        </div>
      ))}
    </div>
  );
}
