# Adding a delivery provider

Implement `DeliveryProvider` from `src/features/delivery/providers/types.ts`:

```ts
interface DeliveryProvider {
  createShipment(order: DeliveryOrder): Promise<{ tracking: string }>;
  getStatus(tracking: string): Promise<DeliveryStatus>;
}
```

1. Create a class in `src/features/delivery/providers/`.
2. Read credentials only from server environment variables.
3. Convert Sultan order fields into the provider's official payload.
4. Convert the provider response into `tracking`.
5. Register the adapter in `provider-factory.ts`.
6. Authenticate and validate provider webhooks before status updates.
7. Map provider statuses to `shipped`, `delivered`, `returned`, or `cancelled`.
8. Never expose API keys to client components.

The included `MockProvider` is suitable for local development.
