import { describe, expect, it } from "vitest";
import { isValidCPF, isValidPhone, maskCPF, maskPhone, maskCEP, orderTotal } from "@/lib/checkout";

describe("checkout", () => {
  it("valida dígitos do CPF", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
    expect(isValidCPF("529.982.247-24")).toBe(false);
    expect(isValidCPF("111.111.111-11")).toBe(false);
    expect(isValidCPF("529.982.247")).toBe(false);
  });
  it("valida celular brasileiro", () => {
    expect(isValidPhone("(11) 99999-9999")).toBe(true);
    expect(isValidPhone("(11) 3333-4444")).toBe(false);
  });
  it("aplica máscaras", () => {
    expect(maskCPF("52998224725")).toBe("529.982.247-25");
    expect(maskPhone("11999999999")).toBe("(11) 99999-9999");
    expect(maskCEP("01001000")).toBe("01001-000");
  });
  it("Bronze + frete grátis + Upgrade Premium = R$ 69,60", () => {
    expect(orderTotal(49.7, 0, 19.9)).toBe(69.6);
    expect(orderTotal(49.7, 9.9, 0)).toBe(59.6);
  });
});
