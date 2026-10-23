import { describe, expect, it } from "vitest";
import { priceOrder } from "@/lib/order";

describe("priceOrder (valor cobrado no PIX, em centavos)", () => {
  it("Bronze + frete grátis = 4970", () => {
    expect(priceOrder({ plan: "bronze", ship: "gratis", upgrade: null, bonus: null })?.total).toBe(4970);
  });
  it("Prata + JadLog + Upgrade Premium = 7990 + 990 + 1990", () => {
    expect(priceOrder({ plan: "prata", ship: "jadlog", upgrade: "premium", bonus: null })?.total).toBe(10970);
  });
  it("bônus de frete zera o Full 24hrs", () => {
    expect(priceOrder({ plan: "ouro", ship: "full", upgrade: null, bonus: "frete" })?.total).toBe(9990);
  });
  it("bônus de R$ 10 desconta 1000", () => {
    expect(priceOrder({ plan: "bronze", ship: "gratis", upgrade: null, bonus: "desconto" })?.total).toBe(3970);
  });
  it("plano inexistente é recusado", () => {
    expect(priceOrder({ plan: "diamante", ship: "gratis", upgrade: null, bonus: null })).toBeNull();
  });
});
