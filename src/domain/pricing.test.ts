import { describe, expect, it } from "vitest";
import { calculateOrderTotal } from "./pricing";

describe("calculateOrderTotal", () => {
  it("adds quantity subtotal and server shipping", () => {
    expect(calculateOrderTotal({ unitPriceDzd: 6500, quantity: 2, shippingFeeDzd: 600 })).toEqual({
      subtotalDzd: 13000,
      shippingDzd: 600,
      totalDzd: 13600,
    });
  });

  it("rejects invalid quantities", () => {
    expect(() => calculateOrderTotal({ unitPriceDzd: 6500, quantity: 0, shippingFeeDzd: 600 })).toThrow();
  });
});
