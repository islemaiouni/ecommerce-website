export const orderStatusValues = [
  "new",
  "calling",
  "confirmed",
  "sent_to_delivery",
  "shipped",
  "delivered",
  "no_answer",
  "cancelled",
  "returned",
] as const;

export type OrderStatus = (typeof orderStatusValues)[number];

const allowedTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  new: ["calling", "confirmed", "no_answer", "cancelled"],
  calling: ["confirmed", "no_answer", "cancelled"],
  confirmed: ["sent_to_delivery", "cancelled"],
  sent_to_delivery: ["shipped", "cancelled", "returned"],
  shipped: ["delivered", "returned", "cancelled"],
  delivered: ["returned"],
  no_answer: ["calling", "cancelled"],
  cancelled: [],
  returned: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return allowedTransitions[from].includes(to);
}
