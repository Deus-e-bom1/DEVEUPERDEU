import { createHash } from "node:crypto";
import { buildUtmifyOrder } from "./utmify";
import { getPending, loadOrder, redis, removePending, withDeliveryLock, type StoredOrder } from "./order-store.server";

const GATEWAY = "https://api.skalepayments.com.br";
const UTMIFY_URL = "https://api.utmify.com.br/api-credentials/orders";

type GatewayTransaction = { id?: string; status?: string; metadata?: Record<string, unknown>; amount?: number; timestamp?: string; transaction?: { amount?: string; updated_at?: string } };
export async function verifiedGatewayTransaction(txId: string): Promise<GatewayTransaction> {
  if (!/^[\w-]{1,100}$/.test(txId)) throw new Error("ID da transação inválido");
  const key = process.env.SKALE_API_KEY;
  if (!key) throw new Error("SKALE_API_KEY ausente");
  const r = await fetch(`${GATEWAY}/transactions/${encodeURIComponent(txId)}`, {
    headers: { "X-API-Key": key }, signal: AbortSignal.timeout(8000), cache: "no-store",
  });
  if (!r.ok) throw new Error(`Skale status HTTP ${r.status}`);
  return await r.json() as GatewayTransaction;
}

const normalize = (v: string) => v.trim().toLowerCase();
const hash = (v: string) => createHash("sha256").update(v).digest("hex");
const cleanDigits = (v: string) => v.replace(/\D/g, "");
const f = (v: string | null) => v && v.length <= 250 ? v : undefined;

async function sendUtmify(o: StoredOrder, approvedAt: Date) {
  const token = process.env.UTMIFY_API_TOKEN;
  if (!token) throw new Error("UTMIFY_API_TOKEN ausente na Vercel");
  const data = buildUtmifyOrder({
    orderId: o.transactionId!, totalCents: o.totalCents, items: o.items,
    customer: o.customer, tracking: o.tracking,
    createdAt: new Date(o.createdAt), approvedAt,
  });
  const res = await fetch(UTMIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-token": token },
    body: JSON.stringify(data), signal: AbortSignal.timeout(9000),
  });
  // Keep orderId stable. Do not mark non-2xx responses as successfully delivered.
  if (!res.ok) {
    console.error(`UTMify HTTP ${res.status}: ${(await res.text()).slice(0, 600)}`);
    throw new Error(`UTMify HTTP ${res.status}`);
  }
}

async function sendMeta(o: StoredOrder, approvedAt: Date) {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID;
  if (!token || !pixelId) throw new Error("META_CAPI_ACCESS_TOKEN / META_PIXEL_ID ausente na Vercel");
  const fullName = normalize(o.customer.name).split(/\s+/);
  const user_data: Record<string, unknown> = {
    em: [hash(normalize(o.customer.email))],
    ph: [hash(`55${cleanDigits(o.customer.phone).replace(/^55/, "")}`)],
    fn: [hash(fullName[0] ?? "")],
    ln: [hash(fullName.slice(1).join(" "))],
  };
  if (o.clientIp) user_data.client_ip_address = o.clientIp;
  if (o.userAgent) user_data.client_user_agent = o.userAgent;
  if (f(o.fbp)) user_data.fbp = o.fbp;
  if (f(o.fbc)) user_data.fbc = o.fbc;
  const body = {
    data: [{
      event_name: "Purchase", event_time: Math.floor(approvedAt.getTime() / 1000),
      event_id: o.transactionId, action_source: "website",
      event_source_url: process.env.PUBLIC_SITE_URL ?? "https://devsperdeshop.vercel.app/checkout",
      user_data,
      custom_data: { currency: "BRL", value: o.totalCents / 100, order_id: o.transactionId,
        content_type: "product", contents: o.items.map((i, n) => ({ id: `item-${n + 1}`, quantity: 1, item_price: i.unitPrice / 100 })) },
    }],
  };
  const r = await fetch(`https://graph.facebook.com/v22.0/${encodeURIComponent(pixelId)}/events`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, access_token: token }), signal: AbortSignal.timeout(9000),
  });
  if (!r.ok) {
    console.error(`Meta CAPI HTTP ${r.status}: ${(await r.text()).slice(0, 600)}`);
    throw new Error(`Meta CAPI HTTP ${r.status}`);
  }
}

/** Verify with Skale's own API; never trust paid status or attribution submitted from browser/webhook. */
export async function processSkalePayment(txId: string): Promise<{ status: string; processed: boolean }> {
  const tx = await verifiedGatewayTransaction(txId);
  if (tx.id && tx.id !== txId) throw new Error("Skale transaction mismatch");
  if (tx.status !== "paid") return { status: tx.status ?? "unknown", processed: false };
  const localId = tx.metadata?.["localOrderId"];
  if (typeof localId !== "string") throw new Error("Skale transaction is missing localOrderId metadata");
  const o = await loadOrder(localId);
  if (!o || o.transactionId !== txId) throw new Error("No matching persisted order for Skale transaction");
  if (typeof tx.amount === "number" && tx.amount !== o.totalCents) throw new Error("Skale transaction amount mismatch");
  if (tx.transaction?.amount && Math.round(Number(tx.transaction.amount) * 100) !== o.totalCents) throw new Error("Skale transaction amount mismatch");
  if (!o.attributionAllowed) {
    await removePending(localId);
    return { status: "paid", processed: true };
  }

  const gatewayApproved = new Date(tx.transaction?.updated_at ?? tx.timestamp ?? "");
  const approvedAt = Number.isNaN(gatewayApproved.getTime()) ? new Date() : gatewayApproved;
  // Run downstream providers in parallel to stay within Skale webhook response time.
  const [okUtm, okMeta] = await Promise.all([
    withDeliveryLock(txId, "utmify", () => sendUtmify(o, approvedAt))
      .catch(e => { console.error("Purchase -> UTMify failed", e); return false; }),
    o.pixelAllowed
      ? withDeliveryLock(txId, "meta", () => sendMeta(o, approvedAt))
          .catch(e => { console.error("Purchase -> Meta failed", e); return false; })
      : Promise.resolve(true),
  ]);
  if (okUtm && okMeta) await removePending(localId);
  return { status: "paid", processed: okUtm && okMeta };
}

/** Called by a protected Vercel Cron route. Also recovers purchases when webhooks were lost. */
export async function retryPendingOrders() {
  const ids = await getPending(30);
  let processed = 0, failed = 0;
  for (const id of ids) {
    const o = await loadOrder(id);
    if (!o) { await removePending(id); continue; }
    if (!o.transactionId) {
      if (Date.now() - new Date(o.createdAt).getTime() > 2 * 86400_000) await removePending(id);
      continue;
    }
    try {
      const r = await processSkalePayment(o.transactionId);
      if (r.processed) processed++;
      else if (Date.now() - new Date(o.createdAt).getTime() > 2 * 86400_000)
        await removePending(id); // expired unpaid PIX is not a sale
    } catch (e) { console.error("Retry order failed", id, e); failed++; }
  }
  // Remove old pending jobs after 14 days to avoid indefinite accumulation.
  await redis(["ZREMRANGEBYSCORE", "deveu:pending", "-inf", Math.floor(Date.now() / 1000) - 14 * 86400]);
  return { scanned: ids.length, processed, failed };
}
