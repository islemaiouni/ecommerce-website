import type { DeliveryProvider } from "./types";
import { MockProvider } from "./mock-provider";

export function getDeliveryProvider(code = "mock"): DeliveryProvider {
  switch (code) {
    case "mock":
    default:
      return new MockProvider();
  }
}
