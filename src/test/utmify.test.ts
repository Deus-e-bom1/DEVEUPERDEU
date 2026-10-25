import { describe, expect, it } from "vitest";
import { buildUtmifyOrder } from "@/lib/utmify";

const base = {
  orderId: "tx_123",
  totalCents: 4970,
  items: [{ title: "Caixa Bronze", unitPrice: 4970 }],
  customer: { name: "  Maria Silva  ", email: " maria@email.com ", phone: "(16) 99999-0000", cpf: "123.456.789-09" },
  tracking: { src: null, sck: null, utm_source: "facebook", utm_campaign: "caixas", utm_medium: null, utm_content: null, utm_term: null },
  createdAt: new Date("2026-10-25T15:00:00.000Z"),
  approvedAt: new Date("2026-10-25T15:05:00.000Z"),
};

describe("buildUtmifyOrder", () => {
  it("marca a venda como paga via pix com o valor em centavos", () => {
    const o = buildUtmifyOrder(base);
    expect(o.status).toBe("paid");
    expect(o.paymentMethod).toBe("pix");
    expect(o.commission.totalPriceInCents).toBe(4970);
    expect(o.products[0]?.priceInCents).toBe(4970);
  });

  it("usa o id da transação como orderId e formata datas UTC", () => {
    const o = buildUtmifyOrder(base);
    expect(o.orderId).toBe("tx_123");
    expect(o.createdAt).toBe("2026-10-25 15:00:00");
    expect(o.approvedDate).toBe("2026-10-25 15:05:00");
  });

  it("limpa os dados do cliente e mantém os parâmetros de campanha", () => {
    const o = buildUtmifyOrder(base);
    expect(o.customer.name).toBe("Maria Silva");
    expect(o.customer.phone).toBe("16999990000");
    expect(o.customer.document).toBe("12345678909");
    expect(o.trackingParameters.utm_source).toBe("facebook");
    expect(o.trackingParameters.utm_campaign).toBe("caixas");
  });

  it("nunca marca como teste", () => {
    expect(buildUtmifyOrder(base).isTest).toBe(false);
  });
});
