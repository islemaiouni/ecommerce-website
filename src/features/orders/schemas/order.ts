import { z } from "zod";
import { normalizeAlgerianPhone } from "@/domain/phone";

export const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .transform((value) => normalizeAlgerianPhone(value) ?? "")
    .refine((value) => value.length > 0, { message: "Numéro algérien invalide" }),
  wilayaCode: z.number().int().min(1).max(58),
  commune: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(300),
  deliveryType: z.enum(["home", "bureau"]),
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  honeypot: z.string().max(0).optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;
