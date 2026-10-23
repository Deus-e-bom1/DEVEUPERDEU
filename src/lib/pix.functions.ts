import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { priceOrder } from "./order";
import { isValidCPF, isValidEmail, isValidName, isValidPhone, onlyDigits } from "./checkout";

const GATEWAY = "https://api.skalepayments.com.br";

function headers() {
  const key = process.env["SKALE_API_KEY"];
  if (!key) throw new Error("Pagamento PIX não configurado (SKALE_API_KEY).");
  return { "X-API-Key": key, "Content-Type": "application/json" };
}

type SkaleTx = { id?: string; status?: string; pix?: { qrcode?: string | null; qrcodeImage?: string | null } };

const input = z.object({
  plan: z.string().max(40),
  ship: z.string().max(40),
  upgrade: z.string().max(40).nullable(),
  bonus: z.string().max(40).nullable(),
  customer: z.object({
    name: z.string().refine(isValidName),
    email: z.string().refine(isValidEmail),
    phone: z.string().refine(isValidPhone),
    cpf: z.string().refine(isValidCPF),
  }),
  address: z.object({
    cep: z.string().max(12), street: z.string().max(120), number: z.string().max(20),
    comp: z.string().max(80), hood: z.string().max(80), city: z.string().max(80), uf: z.string().length(2),
  }),
});

export const createPix = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const order = priceOrder(data);
    if (!order) return { error: "Pedido inválido." as string };
    const c = data.customer;
    const res = await fetch(`${GATEWAY}/transactions`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        amount: order.total,
        paymentMethod: "pix",
        pix: { expiresInDays: 1 },
        customer: { name: c.name.trim(), email: c.email.trim(), phone: onlyDigits(c.phone), document: { number: onlyDigits(c.cpf), type: "cpf" } },
        items: order.items.map((i) => ({ ...i, quantity: 1, tangible: true })),
        shipping: {
          fee: 0,
          address: { street: data.address.street, streetNumber: data.address.number || "S/N", complement: data.address.comp, zipCode: onlyDigits(data.address.cep), neighborhood: data.address.hood, city: data.address.city, state: data.address.uf, country: "br" },
        },
        metadata: { plano: order.plan.id, frete: order.ship.id, upgrade: order.up?.id ?? "", bonus: order.bonus?.id ?? "" },
      }),
    });
    if (!res.ok) {
      console.error(`Skale createPix failed [${res.status}]: ${await res.text()}`);
      return { error: "Não foi possível gerar o PIX. Tente novamente." };
    }
    const tx = (await res.json()) as SkaleTx;
    if (!tx.id || !tx.pix?.qrcode) {
      console.error("Skale createPix: resposta sem QR", JSON.stringify(tx));
      return { error: "Não foi possível gerar o PIX. Tente novamente." };
    }
    return { id: tx.id, code: tx.pix.qrcode, image: tx.pix.qrcodeImage ?? null, total: order.total };
  });

export const getPixStatus = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(100).regex(/^[\w-]+$/) }).parse(d))
  .handler(async ({ data }) => {
    const res = await fetch(`${GATEWAY}/transactions/${data.id}`, { headers: headers() });
    if (!res.ok) {
      console.error(`Skale status failed [${res.status}]: ${await res.text()}`);
      return { status: "unknown" };
    }
    const tx = (await res.json()) as SkaleTx;
    return { status: tx.status ?? "unknown" };
  });
