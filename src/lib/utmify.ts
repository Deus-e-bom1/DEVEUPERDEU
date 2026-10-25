// Registro de vendas na UTMify: monta o pedido no formato da API de conversões
// (POST https://api.utmify.com.br/api-credentials/orders). Venda só conta com PIX pago.

export type TrackingParams = {
  src: string | null;
  sck: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  utm_term: string | null;
};

const UTM_KEY = "deveu-utm-params";
const TRACKED_KEYS = ["src", "sck", "utm_source", "utm_campaign", "utm_medium", "utm_content", "utm_term"] as const;

/** Lê os parâmetros de campanha da URL e os guarda na sessão (sobrevive à navegação landing → checkout). */
export function captureTrackingParams(): TrackingParams {
  const empty: TrackingParams = { src: null, sck: null, utm_source: null, utm_campaign: null, utm_medium: null, utm_content: null, utm_term: null };
  if (typeof window === "undefined") return empty;
  try {
    const fromUrl = new URLSearchParams(window.location.search);
    const stored: unknown = JSON.parse(sessionStorage.getItem(UTM_KEY) || "null");
    const base = stored && typeof stored === "object" ? (stored as Record<string, unknown>) : {};
    const out = { ...empty };
    for (const k of TRACKED_KEYS) {
      const v = fromUrl.get(k) ?? (typeof base[k] === "string" ? (base[k] as string) : null);
      out[k] = v && v.length <= 200 ? v : null;
    }
    sessionStorage.setItem(UTM_KEY, JSON.stringify(out));
    return out;
  } catch {
    return empty;
  }
}

export type UtmifyOrderInput = {
  orderId: string;
  totalCents: number;
  items: { title: string; unitPrice: number }[];
  customer: { name: string; email: string; phone: string; cpf: string };
  tracking: TrackingParams;
  createdAt: Date;
  approvedAt: Date;
};

function fmt(d: Date): string {
  return d.toISOString().slice(0, 19).replace("T", " ");
}

/** Monta o corpo da venda para a UTMify (valores em centavos, datas UTC "YYYY-MM-DD HH:mm:ss"). */
export function buildUtmifyOrder(o: UtmifyOrderInput) {
  return {
    orderId: o.orderId,
    platform: "DeveuPerdeu",
    paymentMethod: "pix",
    status: "paid",
    createdAt: fmt(o.createdAt),
    approvedDate: fmt(o.approvedAt),
    refundedAt: null,
    customer: {
      name: o.customer.name.trim().slice(0, 120),
      email: o.customer.email.trim().slice(0, 255),
      phone: o.customer.phone.replace(/\D/g, "").slice(0, 20),
      document: o.customer.cpf.replace(/\D/g, "").slice(0, 14),
      country: "BR",
      ip: null,
    },
    products: o.items.map((i, n) => ({
      id: `item-${n + 1}`,
      name: i.title.slice(0, 120),
      planId: null,
      planName: null,
      quantity: 1,
      priceInCents: Math.round(i.unitPrice),
    })),
    trackingParameters: o.tracking,
    commission: {
      totalPriceInCents: Math.round(o.totalCents),
      gatewayFeeInCents: 0,
      userCommissionInCents: Math.round(o.totalCents),
    },
    isTest: false,
  };
}
