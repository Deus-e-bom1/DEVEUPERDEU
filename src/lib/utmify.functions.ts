import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { buildUtmifyOrder, type TrackingParams } from "./utmify";

const UTMIFY_URL = "https://api.utmify.com.br/api-credentials/orders";

// Mesmas regiões que exigem consentimento no navegador (src/lib/advertising.ts).
const regulated = new Set("AT BE BG HR CY CZ DK EE FI FR DE GR HU IS IE IT LV LI LT LU MT NL NO PL PT RO SK SI ES SE GB CH".split(" "));

const trackingSchema = z.object({
  src: z.string().max(200).nullable(),
  sck: z.string().max(200).nullable(),
  utm_source: z.string().max(200).nullable(),
  utm_campaign: z.string().max(200).nullable(),
  utm_medium: z.string().max(200).nullable(),
  utm_content: z.string().max(200).nullable(),
  utm_term: z.string().max(200).nullable(),
});

const input = z.object({
  orderId: z.string().min(1).max(100),
  totalCents: z.number().int().min(0).max(10_000_000),
  items: z.array(z.object({ title: z.string().max(120), unitPrice: z.number().min(0).max(10_000_000) })).min(1).max(20),
  customer: z.object({
    name: z.string().max(120),
    email: z.string().max(255),
    phone: z.string().max(30),
    cpf: z.string().max(20),
  }),
  tracking: trackingSchema,
  createdAt: z.string().max(40),
  // O navegador informa se a região/escolha do visitante permite publicidade.
  allowed: z.boolean(),
});

/** Registra a venda na UTMify quando o PIX é confirmado. Falhas aqui nunca bloqueiam o cliente. */
export const reportUtmifySale = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    if (!data.allowed) return { sent: false, reason: "sem permissão de publicidade" };

    // Re-verifica a região no servidor quando o provedor de hospedagem informa o país.
    const country = (getRequestHeader("x-vercel-ip-country") ?? getRequestHeader("cf-ipcountry") ?? "").toUpperCase();
    if (country && (regulated.has(country) || !/^[A-Z]{2}$/.test(country))) {
      return { sent: false, reason: "região sem permissão" };
    }

    const token = process.env["UTMIFY_API_TOKEN"];
    if (!token) {
      console.error("UTMIFY_API_TOKEN não configurado; venda não registrada na UTMify.");
      return { sent: false, reason: "token ausente" };
    }

    const created = new Date(data.createdAt);
    const body = buildUtmifyOrder({
      orderId: data.orderId,
      totalCents: data.totalCents,
      items: data.items,
      customer: data.customer,
      tracking: data.tracking as TrackingParams,
      createdAt: Number.isNaN(created.getTime()) ? new Date() : created,
      approvedAt: new Date(),
    });

    const res = await fetch(UTMIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-token": token },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`UTMify reportSale failed [${res.status}]: ${await res.text()}`);
      return { sent: false, reason: `utmify ${res.status}` };
    }
    return { sent: true };
  });
