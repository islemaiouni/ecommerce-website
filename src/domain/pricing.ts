export type PricingInput = {
  unitPriceDzd: number;
  quantity: number;
  shippingFeeDzd: number;
};

export function calculateOrderTotal({
  unitPriceDzd,
  quantity,
  shippingFeeDzd,
}: PricingInput): { subtotalDzd: number; shippingDzd: number; totalDzd: number } {
  if (!Number.isInteger(unitPriceDzd) || unitPriceDzd < 0) {
    throw new Error("Invalid unit price");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Invalid quantity");
  }
  if (!Number.isInteger(shippingFeeDzd) || shippingFeeDzd < 0) {
    throw new Error("Invalid shipping fee");
  }

  const subtotalDzd = unitPriceDzd * quantity;
  return {
    subtotalDzd,
    shippingDzd: shippingFeeDzd,
    totalDzd: subtotalDzd + shippingFeeDzd,
  };
}
