export const onlyDigits = (s: string) => s.replace(/\D/g, "");

export function maskCPF(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
export function maskCEP(v: string) {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function isValidCPF(v: string) {
  const d = onlyDigits(v);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}
/** Celular BR: DDD válido (11–99) + 9 dígitos começando com 9. */
export function isValidPhone(v: string) {
  const d = onlyDigits(v);
  return d.length === 11 && Number(d.slice(0, 2)) >= 11 && d[2] === "9";
}
export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isValidName = (v: string) => v.trim().split(/\s+/).filter(Boolean).length >= 2 && v.trim().length <= 100;

export function orderTotal(price: number, shipping: number, upgrade: number) {
  return Math.round((price + shipping + upgrade) * 100) / 100;
}

export type CepResult = { street: string; neighborhood: string; city: string; state: string };

export async function lookupCEP(cep: string): Promise<CepResult | null> {
  const d = onlyDigits(cep);
  if (d.length !== 8) return null;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
    if (r.ok) {
      const j = await r.json();
      if (j.erro) return null;
      return { street: j.logradouro ?? "", neighborhood: j.bairro ?? "", city: j.localidade ?? "", state: j.uf ?? "" };
    }
  } catch {
    /* tenta alternativa */
  }
  const r = await fetch(`https://brasilapi.com.br/api/cep/v1/${d}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("network");
  const j = await r.json();
  return { street: j.street ?? "", neighborhood: j.neighborhood ?? "", city: j.city ?? "", state: j.state ?? "" };
}
