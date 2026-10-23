import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronRight, ChevronUp, CircleCheck, Gift, Loader2, Lock, MapPin, Shield, Star, Truck, User, Zap } from "lucide-react";
import { site } from "@/config/site";
import { brl } from "@/components/landing/shared";
import { PixScreen } from "@/components/checkout/PixScreen";
import { RouletteModal, type Prize } from "@/components/checkout/Roulette";
import { isValidCPF, isValidEmail, isValidName, isValidPhone, lookupCEP, maskCEP, maskCPF, maskPhone, onlyDigits, orderTotal } from "@/lib/checkout";
import { useServerFn } from "@tanstack/react-start";
import { createPix, getPixStatus } from "@/lib/pix.functions";

type Search = { plano?: string | undefined };

export const Route = createFileRoute("/checkout")({
  validateSearch: (s: Record<string, unknown>): Search => ({ plano: typeof s["plano"] === "string" ? s["plano"] : undefined }),
  head: () => ({
    meta: [
      { title: "Checkout — Deveu Perdeu" },
      { name: "description", content: "Finalize o pedido da sua caixa surpresa Deveu Perdeu com pagamento via PIX." },
      { property: "og:title", content: "Checkout — Deveu Perdeu" },
      { property: "og:description", content: "Finalize o pedido da sua caixa surpresa com pagamento via PIX." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
const shipIcons = { gift: Gift, truck: Truck, pin: MapPin, zap: Zap } as const;
const trustIcons = { shield: Shield, zap: Zap, lock: Lock } as const;

const inputCls = "h-12 w-full rounded-xl border border-border bg-card px-3.5 text-base outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({ label, error, children, className = "" }: { label: string; error?: string | undefined; children: ReactNode; className?: string }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-destructive">{error}</span>}
    </label>
  );
}

function StepCard({ n, title, subtitle, icon, state, open, onToggle, children }: { n: number; title: string; subtitle: string; icon: ReactNode; state: "todo" | "current" | "done"; open: boolean; onToggle: () => void; children: ReactNode }) {
  const disabled = state === "todo";
  return (
    <section className={`rounded-2xl border border-border bg-card shadow-sm ${disabled ? "opacity-50" : ""}`}>
      <button type="button" disabled={disabled} onClick={onToggle} className="flex w-full items-center gap-3 p-4 text-left">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${state === "done" ? "bg-success text-primary-foreground" : state === "current" ? "bg-ink text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {state === "done" ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-black leading-tight">{title}</span>
          <span className="block text-sm text-muted-foreground">{subtitle}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-primary">{icon}{open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </section>
  );
}

function Radio({ on }: { on: boolean }) {
  return on ? (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="h-3 w-3" strokeWidth={3} /></span>
  ) : (
    <span className="h-5 w-5 shrink-0 rounded-full border-2 border-border" />
  );
}

function Checkout() {
  const { plano } = Route.useSearch();
  const plan = site.plans.find((p) => p.id === plano) ?? site.plans[0]!;
  const c = site.checkout;
  const shippingOpts = c.shipping.filter((s) => s.enabled);

  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(1);
  const [d, setD] = useState({ name: "", email: "", phone: "", cpf: "" });
  const [a, setA] = useState({ cep: "", street: "", number: "", noNumber: false, comp: "", hood: "", city: "", uf: "" });
  const [ship, setShip] = useState(shippingOpts[0]?.id ?? "");
  const [upgrade, setUpgrade] = useState<string | null>(null);
  const [errs, setErrs] = useState<Partial<Record<"name"|"email"|"phone"|"cpf"|"cep"|"street"|"number"|"hood"|"city"|"uf"|"ship", string>>>({});
  const [cepState, setCepState] = useState<"idle" | "loading" | "error" | "notfound">("idle");
  const [submitted, setSubmitted] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [bonus, setBonus] = useState<Prize | null>(null);
  const [pix, setPix] = useState<{ id: string; code: string; image: string | null } | null>(null);
  const [pixErr, setPixErr] = useState<string | null>(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const createPixFn = useServerFn(createPix);
  const statusFn = useServerFn(getPixStatus);

  const startPix = async (b: Prize | null) => {
    setSubmitted(true);
    if (pix || pixLoading) return;
    setPixLoading(true);
    setPixErr(null);
    try {
      const r = await createPixFn({ data: { plan: plan.id, ship, upgrade, bonus: b?.id ?? null, customer: d, address: { cep: a.cep, street: a.street, number: a.noNumber ? "" : a.number, comp: a.comp, hood: a.hood, city: a.city, uf: a.uf } } });
      if ("error" in r) setPixErr(r.error);
      else setPix({ id: r.id, code: r.code, image: r.image });
    } catch {
      setPixErr("Não foi possível gerar o PIX. Tente novamente.");
    } finally {
      setPixLoading(false);
    }
  };

  useEffect(() => {
    if (!pix || paid) return;
    const t = setInterval(async () => {
      try {
        const r = await statusFn({ data: { id: pix.id } });
        if (r.status === "paid") setPaid(true);
      } catch { /* tenta de novo no próximo ciclo */ }
    }, 5000);
    return () => clearInterval(t);
  }, [pix, paid, statusFn]);

  useEffect(() => {
    const digits = onlyDigits(a.cep);
    if (digits.length !== 8) return;
    let alive = true;
    setCepState("loading");
    lookupCEP(digits)
      .then((r) => {
        if (!alive) return;
        if (!r) return setCepState("notfound");
        setCepState("idle");
        setA((p) => ({ ...p, street: r.street || p.street, hood: r.neighborhood || p.hood, city: r.city || p.city, uf: r.state || p.uf }));
      })
      .catch(() => alive && setCepState("error"));
    return () => { alive = false; };
  }, [a.cep]);

  const shipSel = shippingOpts.find((s) => s.id === ship);
  const upSel = c.upgrades.find((u) => u.id === upgrade);
  const shipCost = bonus?.kind === "shipping" ? 0 : shipSel?.price ?? 0;
  const total = Math.max(0, orderTotal(plan.price, shipCost, upSel?.price ?? 0) - (bonus?.kind === "discount" ? bonus.value : 0));

  const goData = () => {
    const e: Partial<Record<"name"|"email"|"phone"|"cpf"|"cep"|"street"|"number"|"hood"|"city"|"uf"|"ship", string>> = {};
    if (!isValidName(d.name)) e.name = "Informe nome e sobrenome.";
    if (!isValidEmail(d.email)) e.email = "E-mail inválido.";
    if (!isValidPhone(d.phone)) e.phone = "WhatsApp inválido.";
    if (!isValidCPF(d.cpf)) e.cpf = "CPF inválido.";
    setErrs(e);
    if (Object.keys(e).length) return;
    setStep((s) => Math.max(s, 2));
    setOpen(2);
  };
  const goShip = () => {
    const e: Partial<Record<"name"|"email"|"phone"|"cpf"|"cep"|"street"|"number"|"hood"|"city"|"uf"|"ship", string>> = {};
    if (onlyDigits(a.cep).length !== 8) e.cep = "CEP inválido.";
    if (!a.street.trim()) e.street = "Informe a rua.";
    if (!a.noNumber && !a.number.trim()) e.number = "Informe o número.";
    if (!a.hood.trim()) e.hood = "Informe o bairro.";
    if (!a.city.trim()) e.city = "Informe a cidade.";
    if (!UFS.includes(a.uf)) e.uf = "Selecione o estado.";
    if (!shipSel) e.ship = "Escolha o frete.";
    setErrs(e);
    if (Object.keys(e).length) return;
    setStep(3);
    setOpen(3);
  };
  const stateOf = (n: number) => (step > n ? "done" : step === n ? "current" : "todo") as "todo" | "current" | "done";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-ink">
        <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
          <Link to="/" aria-label={site.brand.name}>
            {site.brand.logo ? <img src={site.brand.logo} alt={site.brand.name} className="h-9 w-auto" /> : <span className="font-black text-primary-foreground">{site.brand.name}</span>}
          </Link>
          <span className="flex items-center gap-1.5 text-sm font-bold text-primary-foreground"><Lock className="h-4 w-4 text-success" /> {c.secureLabel}</span>
        </div>
      </header>
      <div className="bg-primary px-4 py-2.5 text-center text-xs font-bold text-primary-foreground sm:text-sm">
        <CircleCheck className="mr-1.5 inline h-4 w-4 align-[-3px]" />{c.notice}
      </div>

      <main className="mx-auto max-w-xl space-y-3 px-3 py-4">
        <ol className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground">
          {["Dados", "Entrega", "Pagamento"].map((l, i) => (
            <li key={l} className="flex items-center gap-2">
              {i > 0 && <span className="w-6 border-t border-dashed border-muted-foreground/50" />}
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${step > i + 1 ? "bg-success text-primary-foreground" : step === i + 1 ? "bg-ink text-primary-foreground" : "bg-muted-foreground/30 text-primary-foreground"}`}>
                {step > i + 1 ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
              </span>
              <span className={step >= i + 1 ? "text-foreground" : ""}>{l}</span>
            </li>
          ))}
        </ol>

        <StepCard n={1} title="Dados pessoais" subtitle="Precisamos apenas das informações essenciais." icon={<User className="h-5 w-5" />} state={stateOf(1)} open={open === 1} onToggle={() => setOpen(open === 1 ? 0 : 1)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nome completo" error={errs.name} className="sm:col-span-2">
              <input className={inputCls} autoComplete="name" maxLength={100} placeholder="Seu nome completo" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
            </Field>
            <Field label="E-mail" error={errs.email}>
              <input className={inputCls} type="email" autoComplete="email" maxLength={255} placeholder="seu@email.com" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} />
            </Field>
            <Field label="WhatsApp" error={errs.phone}>
              <div className="flex h-12 items-center rounded-xl border border-border bg-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-3.5 pr-2 font-bold text-muted-foreground">+55</span>
                <input className="h-full min-w-0 flex-1 bg-transparent pr-3 text-base outline-none placeholder:text-muted-foreground/60" inputMode="numeric" autoComplete="tel-national" placeholder="(11) 99999-9999" value={d.phone} onChange={(e) => setD({ ...d, phone: maskPhone(e.target.value) })} />
              </div>
            </Field>
            <Field label="CPF" error={errs.cpf} className="sm:col-span-2">
              <input className={inputCls} inputMode="numeric" placeholder="000.000.000-00" value={d.cpf} onChange={(e) => setD({ ...d, cpf: maskCPF(e.target.value) })} />
            </Field>
          </div>
          <button type="button" onClick={goData} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-black text-primary-foreground shadow-glow transition active:scale-[.98]">
            Continuar <ChevronRight className="h-4 w-4" />
          </button>
        </StepCard>

        <StepCard n={2} title="Entrega" subtitle="Informe o endereço para envio." icon={<MapPin className="h-5 w-5 text-muted-foreground" />} state={stateOf(2)} open={open === 2} onToggle={() => setOpen(open === 2 ? 0 : 2)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="CEP" error={errs.cep} className="col-span-2">
              <div className="relative">
                <input className={inputCls} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" value={a.cep} onChange={(e) => { setCepState("idle"); setA({ ...a, cep: maskCEP(e.target.value) }); }} />
                {cepState === "loading" && <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-primary" />}
              </div>
              {cepState === "notfound" && <span className="mt-1 block text-xs font-semibold text-destructive">CEP não encontrado. Preencha o endereço manualmente.</span>}
              {cepState === "error" && <span className="mt-1 block text-xs font-semibold text-destructive">Não foi possível consultar o CEP. Preencha manualmente.</span>}
            </Field>
            <Field label="Rua / Endereço" error={errs.street} className="col-span-2">
              <input className={inputCls} autoComplete="address-line1" placeholder="Rua, Avenida..." value={a.street} onChange={(e) => setA({ ...a, street: e.target.value })} />
            </Field>
            <Field label="Número" error={errs.number}>
              <input className={inputCls} disabled={a.noNumber} placeholder={a.noNumber ? "S/N" : "123"} value={a.noNumber ? "" : a.number} onChange={(e) => setA({ ...a, number: e.target.value })} />
              <span className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <input type="checkbox" checked={a.noNumber} onChange={(e) => setA({ ...a, noNumber: e.target.checked })} className="accent-primary" /> Sem número
              </span>
            </Field>
            <Field label="Complemento">
              <input className={inputCls} placeholder="Apto, Bloco..." value={a.comp} onChange={(e) => setA({ ...a, comp: e.target.value })} />
            </Field>
            <Field label="Bairro" error={errs.hood}>
              <input className={inputCls} placeholder="Bairro" value={a.hood} onChange={(e) => setA({ ...a, hood: e.target.value })} />
            </Field>
            <Field label="Cidade" error={errs.city}>
              <input className={inputCls} placeholder="Cidade" value={a.city} onChange={(e) => setA({ ...a, city: e.target.value })} />
            </Field>
            <Field label="Estado" error={errs.uf} className="col-span-2">
              <select className={inputCls} value={a.uf} onChange={(e) => setA({ ...a, uf: e.target.value })}>
                <option value="">Selecione</option>
                {UFS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </Field>
          </div>
          <p className="mb-2 mt-4 text-sm font-bold">Escolha o frete:</p>
          <div className="space-y-2">
            {shippingOpts.map((s) => {
              const Icon = shipIcons[s.icon as keyof typeof shipIcons] ?? Truck;
              const on = ship === s.id;
              return (
                <button key={s.id} type="button" onClick={() => setShip(s.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${on ? "border-primary bg-orange-soft" : "border-border bg-card"}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted ${s.icon === "gift" ? "text-success-ink" : s.icon === "pin" || s.icon === "zap" ? "text-primary" : "text-muted-foreground"}`}><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black">{s.name}</span>
                    <span className={`block text-xs ${s.highlight ? "font-semibold text-primary" : "text-muted-foreground"}`}>{s.detail}</span>
                  </span>
                  <span className={`shrink-0 text-sm font-black ${s.price === 0 ? "text-success-ink" : ""}`}>{s.price === 0 ? "Grátis" : `R$ ${brl(s.price)}`}</span>
                  <Radio on={on} />
                </button>
              );
            })}
          </div>
          {errs.ship && <p className="mt-1 text-xs font-semibold text-destructive">{errs.ship}</p>}
          <button type="button" onClick={goShip} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-black text-primary-foreground shadow-glow transition active:scale-[.98]">
            Continuar para Pagamento <ChevronRight className="h-4 w-4" />
          </button>
        </StepCard>

        <StepCard n={3} title="Pagamento" subtitle="Escolha a forma de pagamento." icon={null} state={stateOf(3)} open={open === 3} onToggle={() => setOpen(open === 3 ? 0 : 3)}>
          {submitted ? <><div className="mb-3 flex items-center gap-3 rounded-xl border border-success/40 bg-success-soft p-3"><span><span className="block font-black">{c.pixTitle}</span><span className="block text-sm text-muted-foreground">{c.pixText}</span></span></div><PixScreen code={pix?.code} image={pix?.image ?? undefined} loading={pixLoading} error={pixErr} paid={paid} onRetry={() => startPix(bonus)} /></> : <>
          <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-success-soft p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-ink text-primary-foreground">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d="M12 2.5 21.5 12 12 21.5 2.5 12z" /></svg>
            </span>
            <span><span className="block font-black">{c.pixTitle}</span><span className="block text-sm text-muted-foreground">{c.pixText}</span></span>
          </div>

          <div className="mt-3 rounded-xl border-2 border-dashed border-primary/60 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase text-primary"><Star className="h-4 w-4" fill="currentColor" /> Aproveite! Adicione um upgrade ao seu pedido:</p>
            <div className="space-y-2">
              {c.upgrades.map((u) => {
                const on = upgrade === u.id;
                return (
                  <button key={u.id} type="button" disabled={!u.enabled} onClick={() => setUpgrade(on ? null : u.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-50 ${on ? "border-primary bg-orange-soft" : "border-border bg-card"}`}>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-primary" : "border-border"}`}>{on && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}</span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-black">{u.name}</span><span className="block text-xs text-muted-foreground">{u.enabled ? u.detail : "Indisponível no momento"}</span></span>
                    <span className="shrink-0 text-sm font-black text-primary">+ R$ {brl(u.price)}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setUpgrade(null)} className="mt-3 flex w-full items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${upgrade === null ? "border-primary" : "border-border"}`}>{upgrade === null && <span className="h-2 w-2 rounded-full bg-primary" />}</span>
              Não quero nenhum upgrade
            </button>
          </div>

          <button type="button" onClick={() => (bonus ? startPix(bonus) : setShowWheel(true))} className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-black uppercase text-primary-foreground shadow-glow transition active:scale-[.98]">
            <Lock className="h-5 w-5" /> Finalizar pedido
          </button>
          </>}
          {showWheel && <RouletteModal onRedeem={(p) => { setBonus(p); setShowWheel(false); startPix(p); }} />}
        </StepCard>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-black">Resumo do pedido</h2>
          <div className="mt-3 flex items-center gap-4 border-b border-border pb-4">
            <img src={plan.image} alt={plan.name} className="h-20 w-20 shrink-0 rounded-xl border border-border bg-muted object-contain" />
            <div><div className="font-bold">{plan.name.replace("Caixa", "Caixa Surpresa")}</div><div className="text-xl font-black text-primary">R$ {brl(plan.price)}</div></div>
          </div>
          <dl className="space-y-1.5 border-b border-border py-3 text-sm">
            <div className="flex justify-between text-muted-foreground"><dt>Subtotal</dt><dd>R$ {brl(plan.price)}</dd></div>
            {shipSel && <div className="flex justify-between text-muted-foreground"><dt>{shipSel.name}</dt><dd className={shipCost === 0 ? "font-semibold text-success-ink" : ""}>{shipCost === 0 ? "Grátis" : `R$ ${brl(shipCost)}`}</dd></div>}
            {upSel && <div className="flex justify-between text-primary"><dt>{upSel.name}</dt><dd>+ R$ {brl(upSel.price)}</dd></div>}
            {bonus && <div className="flex justify-between font-semibold text-success-ink"><dt>Bônus: {bonus.title}</dt><dd>{bonus.kind === "discount" ? `- R$ ${brl(bonus.value)}` : "Grátis"}</dd></div>}
          </dl>
          <div className="flex items-center justify-between pt-3"><span className="text-xl font-black">Total</span><span className="text-xl font-black text-primary">R$ {brl(total)}</span></div>
        </section>

        <div className="grid grid-cols-3 gap-2">
          {c.trust.map((t) => {
            const Icon = trustIcons[t.icon as keyof typeof trustIcons] ?? Shield;
            return (
              <div key={t.title} className="rounded-xl border border-border bg-card p-2.5 text-center">
                <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-ink text-primary-foreground"><Icon className="h-4 w-4" /></span>
                <div className="mt-1.5 text-xs font-bold">{t.title}</div>
                <div className="text-[10px] leading-tight text-muted-foreground">{t.text}</div>
              </div>
            );
          })}
        </div>
        <p className="flex items-center justify-center gap-1.5 py-8 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> {site.brand.name} © Todos os direitos reservados.</p>
        <p className="pb-6 text-center text-xs text-muted-foreground"><Link to="/privacidade" className="underline">Privacidade e escolhas de publicidade</Link></p>
      </main>
    </div>
  );
}
