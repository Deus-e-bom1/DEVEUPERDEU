/** Persistent order snapshot and lock storage, via server-only Upstash Redis REST.
 * No browser-visible key; TTL limits retention of personal data.
 */
export type StoredOrder = {
  localId: string;
  transactionId: string | null;
  totalCents: number;
  items: { title: string; unitPrice: number }[];
  customer: { name: string; email: string; phone: string; cpf: string };
  tracking: {
    src: string | null; sck: string | null; utm_source: string | null; utm_campaign: string | null;
    utm_medium: string | null; utm_content: string | null; utm_term: string | null;
  };
  attributionAllowed: boolean;
  pixelAllowed: boolean;
  fbp: string | null;
  fbc: string | null;
  clientIp: string | null;
  userAgent: string | null;
  createdAt: string;
};

const TTL_SECONDS = 14 * 86400;
const KEY = (id: string) => `deveu:order:${id}`;

export async function redis(command: (string | number)[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Configuração ausente: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN");
  const response = await fetch(url.replace(/\/$/, ""), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(8000),
  });
  const data = await response.json() as { result?: unknown; error?: string };
  if (!response.ok || data.error) throw new Error(`Falha no armazenamento de pedidos: ${response.status} ${data.error ?? ""}`);
  return data.result;
}

export async function saveOrder(o: StoredOrder) {
  const result = await redis(["SET", KEY(o.localId), JSON.stringify(o), "EX", TTL_SECONDS]);
  if (result !== "OK") throw new Error("Não foi possível salvar o pedido no banco");
}
export async function loadOrder(localId: string): Promise<StoredOrder | null> {
  if (!/^[a-f0-9-]{36}$/.test(localId)) return null;
  const result = await redis(["GET", KEY(localId)]);
  return typeof result === "string" ? JSON.parse(result) as StoredOrder : null;
}

export async function withDeliveryLock(id: string, platform: "utmify" | "meta", deliver: () => Promise<void>): Promise<boolean> {
  const prefix = `deveu:sent:${platform}:${id}`;
  if (await redis(["GET", prefix]) === "sent") return true;
  const locked = await redis(["SET", `deveu:lock:${platform}:${id}`, "1", "EX", 90, "NX"]);
  if (locked !== "OK") return false; // another webhook/request is processing this order
  try {
    if (await redis(["GET", prefix]) === "sent") return true;
    await deliver();
    await redis(["SET", prefix, "sent", "EX", 90 * 86400]);
    return true;
  } finally {
    await redis(["DEL", `deveu:lock:${platform}:${id}`]);
  }
}

export async function enqueuePending(localId: string) {
  await redis(["ZADD", "deveu:pending", Math.floor(Date.now() / 1000), localId]);
}
export async function removePending(localId: string) {
  await redis(["ZREM", "deveu:pending", localId]);
}
export async function getPending(limit = 20): Promise<string[]> {
  const result = await redis(["ZRANGE", "deveu:pending", 0, limit - 1]);
  return Array.isArray(result) ? result.filter((s): s is string => typeof s === "string") : [];
}
