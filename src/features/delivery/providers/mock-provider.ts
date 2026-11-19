import type { DeliveryOrder, DeliveryProvider, DeliveryStatus } from "./types";

export class MockProvider implements DeliveryProvider {
  async createShipment(order: DeliveryOrder) {
    return { tracking: `MOCK-${order.orderNumber}-${order.id.slice(0, 6).toUpperCase()}` };
  }

  async getStatus(tracking: string): Promise<DeliveryStatus> {
    void tracking;
    return "pending";
  }
}
