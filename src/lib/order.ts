import { site } from "@/config/site";

export type OrderInput = { plan: string; ship: string; upgrade: string | null; bonus: string | null };

/** Recalcula o pedido a partir da configuração (nunca confia em valores vindos do navegador). Retorna null se algo for inválido. */
export function priceOrder(o: OrderInput) {
  const plan = site.plans.find((p) => p.id === o.plan);
  const ship = site.checkout.shipping.find((s) => s.id === o.ship && s.enabled);
  const up = o.upgrade ? site.checkout.upgrades.find((u) => u.id === o.upgrade && u.enabled) : undefined;
  const bonus = o.bonus ? site.checkout.roulette.prizes.find((p) => p.id === o.bonus) : undefined;
  if (!plan || !ship || (o.upgrade && !up) || (o.bonus && !bonus)) return null;
  const cents = (v: number) => Math.round(v * 100);
  const shipCents = bonus?.kind === "shipping" ? 0 : cents(ship.price);
  const discount = bonus?.kind === "discount" ? cents(bonus.value) : 0;
  const items = [
    { title: plan.name, unitPrice: cents(plan.price) },
    ...(up ? [{ title: up.name, unitPrice: cents(up.price) }] : []),
    ...(shipCents ? [{ title: `Frete ${ship.name}`, unitPrice: shipCents }] : []),
  ];
  const total = Math.max(0, items.reduce((s, i) => s + i.unitPrice, 0) - discount);
  // Align item amounts with the total Pix charge, including roulette discounts.
  if (discount > 0 && items[0]) {
    let remaining = discount;
    for (const item of items) {
      const applied = Math.min(remaining, item.unitPrice);
      item.unitPrice -= applied;
      remaining -= applied;
      if (!remaining) break;
    }
  }
  return { total, items, plan, ship, up, bonus };
}
