import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
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
const nullableTracking = z.string().max(200).nullable();
const trackingSchema = z.object({
  src: nullableTracking, sck: nullableTracking, utm_source: nullableTracking,
  utm_campaign: nullableTracking, utm_medium: nullableTracking,
  utm_content: nullableTracking, utm_term: nullableTracking,
});
const input = z.object({
  plan: z.string().max(40), ship: z.string().max(40),
  upgrade: z.string().max(40).nullable(), bonus: z.string().max(40).nullable(),
  customer: z.object({
    name: z.string().refine(isValidName), email: z.string().refine(isValidEmail),
    phone: z.string().refine(isValidPhone), cpf: z.string().refine(isValidCPF),
  }),
  address: z.object({
    cep: z.string().max(12), street: z.string().max(120), number: z.string().max(20),
    comp: z.string().max(80), hood: z.string().max(80), city: z.string().max(80), uf: z.string().length(2),
  }),
  tracking: trackingSchema,
  consent: z.object({ attribution: z.boolean(), pixel: z.boolean() }),
  fbp: z.string().max(250).nullable(), fbc: z.string().max(250).nullable(),
});
const regulated = new Set("AT BE BG HR CY CZ DK EE FI FR DE GR HU IS IE IT LV LI LT LU MT NL NO PL PT RO SK SI ES SE GB CH".split(" "));

export const createPix = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { saveOrder, enqueuePending } = await import("./order-store.server");
    const order = priceOrder(data);
    if (!order) return { error: "Pedido inválido." as string };
    const key = process.env["SKALE_API_KEY"];
    if (!key) return { error: "Gateway de pagamento não configurado." as string };
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN)
      return { error: "Checkout temporariamente indisponível: banco de pedidos não configurado." as string };
    const country = (getRequestHeader("x-vercel-ip-country") ?? getRequestHeader("cf-ipcountry") ?? "").toUpperCase();
    const restrict = country !== "" && (regulated.has(country) || !/^[A-Z]{2}$/.test(country));
    const attributionAllowed = Boolean(data.consent.attribution && !restrict);
    const pixelAllowed = Boolean(data.consent.pixel && attributionAllowed);
    const localId = crypto.randomUUID();
    const saved = {
      localId, transactionId: null, totalCents: order.total,
      items: order.items, customer: data.customer,
      tracking: data.tracking,
      attributionAllowed, pixelAllowed,
      fbp: pixelAllowed ? data.fbp : null, fbc: pixelAllowed ? data.fbc : null,
      clientIp: pixelAllowed ? (getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? null) : null,
      userAgent: pixelAllowed ? (getRequestHeader("user-agent") ?? null) : null,
      createdAt: new Date().toISOString(),
    };
    try { await saveOrder(saved); }
    catch (e) { console.error("Order store unavailable", e); return { error: "Falha temporária ao preparar pedido. Tente novamente." as string }; }
    const c = data.customer;
    const webhookUrl = `${(process.env.PUBLIC_SITE_URL ?? "https://devsperdeshop.vercel.app").replace(/\/$/, "")}/api/webhooks/skale`;
    let response: Response;
    try {
      response = await fetch(`${GATEWAY}/transactions`, {
        method: "POST", headers: headers(),
        body: JSON.stringify({
          amount: order.total, paymentMethod: "pix", pix: { expiresInDays: 1 },
          customer: { name: c.name.trim(), email: c.email.trim(), phone: onlyDigits(c.phone), document: { number: onlyDigits(c.cpf), type: "cpf" } },
          items: order.items.map(i => ({ ...i, quantity: 1, tangible: true })),
          shipping: { fee: 0, address: { street: data.address.street, streetNumber: data.address.number || "S/N", complement: data.address.comp, zipCode: onlyDigits(data.address.cep), neighborhood: data.address.hood, city: data.address.city, state: data.address.uf, country: "br" } },
          metadata: { localOrderId: localId, plano: order.plan.id, frete: order.ship.id, upgrade: order.up?.id ?? "", bonus: order.bonus?.id ?? "" },
          postbackUrl: webhookUrl,
        }), signal: AbortSignal.timeout(12000),
      });
    } catch (e) { console.error("Skale network error", e); return { error: "Não foi possível gerar o PIX. Tente novamente." as string }; }
    if (!response.ok) {
      console.error(`Skale createPix failed [${response.status}]: ${(await response.text()).slice(0, 600)}`);
      return { error: "Não foi possível gerar o PIX. Tente novamente." as string };
    }
    const tx = (await response.json()) as SkaleTx;
    if (!tx.id || !tx.pix?.qrcode) {
      console.error("Skale createPix returned no transaction ID / QR code");
      return { error: "Não foi possível gerar o PIX. Tente novamente." as string };
    }
    try {
      await saveOrder({ ...saved, transactionId: tx.id });
      await enqueuePending(localId);
    } catch (e) {
      console.error("Cannot bind PIX to durable order", e);
      return { error: "Erro ao finalizar pedido. Contate o suporte se aparecer uma cobrança." as string };
    }
    return { id: tx.id, code: tx.pix.qrcode, image: tx.pix.qrcodeImage ?? null, total: order.total, items: order.items };
  });

export const getPixStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().min(1).max(100).regex(/^[\w-]+$/) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const { processSkalePayment } = await import("./purchase-tracking.server");
      const result = await processSkalePayment(data.id);
      return { status: result.status };
    } catch (e) {
      console.error("Skale status/recording error", e);
      // Legacy orders created before this deployment have no localOrderId.
      // Still display the correct gateway status, but never invent conversion data.
      try {
        const { verifiedGatewayTransaction } = await import("./purchase-tracking.server");
        const tx = await verifiedGatewayTransaction(data.id);
        return { status: tx.status ?? "unknown" };
      } catch { return { status: "unknown" }; }
    }
  });
