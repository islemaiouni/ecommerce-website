export type DeliveryStatus = "pending" | "in_transit" | "delivered" | "returned" | "cancelled";

export type DeliveryOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  wilayaCode: number;
  commune: string;
  address: string;
  deliveryType: "home" | "bureau";
  codAmountDzd: number;
};

export interface DeliveryProvider {
  createShipment(order: DeliveryOrder): Promise<{ tracking: string }>;
  getStatus(tracking: string): Promise<DeliveryStatus>;
}
