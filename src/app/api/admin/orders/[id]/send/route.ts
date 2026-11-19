import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/infrastructure/supabase/server";
import { createAdminSupabase } from "@/infrastructure/supabase/admin";
import { getDeliveryProvider } from "@/features/delivery/providers/provider-factory";

const sendSchema = z.object({ providerCode: z.string().default("mock") });

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = sendSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const auth = await createServerSupabase();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { data: profile } = await auth.from("admin_profiles").select("role").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const admin = createAdminSupabase();
  const { data: order } = await admin.from("orders").select("*").eq("id", id).single();
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  if (order.status !== "confirmed") return NextResponse.json({ error: "La commande doit être confirmée" }, { status: 409 });

  const provider = getDeliveryProvider(parsed.data.providerCode);
  const shipment = await provider.createShipment({
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.customer_name,
    phone: order.customer_phone,
    wilayaCode: order.wilaya_code,
    commune: order.commune,
    address: order.address,
    deliveryType: order.delivery_type,
    codAmountDzd: order.total_dzd,
  });

  const { error } = await admin.from("orders").update({
    status: "sent_to_delivery",
    tracking_number: shipment.tracking,
  }).eq("id", id);
  if (error) return NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 });
  await admin.from("order_events").insert({
    order_id: id,
    actor_id: user.id,
    from_status: "confirmed",
    to_status: "sent_to_delivery",
    note: `Expédiée avec ${parsed.data.providerCode} · ${shipment.tracking}`,
  });
  return NextResponse.json({ tracking: shipment.tracking });
}
