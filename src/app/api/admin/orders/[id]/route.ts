import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/infrastructure/supabase/server";
import { createAdminSupabase } from "@/infrastructure/supabase/admin";
import { canTransition, type OrderStatus } from "@/domain/status-machine";

const updateSchema = z.object({
  status: z.enum(["new","calling","confirmed","sent_to_delivery","shipped","delivered","no_answer","cancelled","returned"]),
  note: z.string().max(1000).optional(),
  address: z.string().trim().min(5).max(300).optional(),
  wilayaCode: z.number().int().min(1).max(58).optional(),
  quantity: z.number().int().min(1).max(10).optional(),
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const auth = await createServerSupabase();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { data: profile } = await auth.from("admin_profiles").select("role").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const admin = createAdminSupabase();
  const { data: order } = await admin
    .from("orders")
    .select("status,wilaya_code,delivery_type")
    .eq("id", id)
    .single();
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  if (!canTransition(order.status as OrderStatus, parsed.data.status as OrderStatus)) {
    return NextResponse.json({ error: "Transition de statut invalide" }, { status: 409 });
  }

  const updates: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.address) updates.address = parsed.data.address;
  if (parsed.data.wilayaCode) updates.wilaya_code = parsed.data.wilayaCode;

  if (parsed.data.quantity) {
    const { data: item } = await admin
      .from("order_items")
      .select("variant_id, unit_price_dzd")
      .eq("order_id", id)
      .limit(1)
      .maybeSingle();
    if (!item) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

    const { data: variant } = await admin
      .from("product_variants")
      .select("stock")
      .eq("id", item.variant_id)
      .single();
    if (!variant || variant.stock < parsed.data.quantity) {
      return NextResponse.json({ error: "Stock insuffisant" }, { status: 409 });
    }

    const subtotal = item.unit_price_dzd * parsed.data.quantity;
    const wilayaCode = parsed.data.wilayaCode ?? order.wilaya_code;
    const { data: shipping } = await admin
      .from("shipping_rates")
      .select("fee_dzd")
      .eq("wilaya_code", wilayaCode)
      .eq("delivery_type", order.delivery_type)
      .single();
    if (!shipping) return NextResponse.json({ error: "Frais indisponibles" }, { status: 409 });

    updates.subtotal_dzd = subtotal;
    updates.shipping_dzd = shipping.fee_dzd;
    updates.total_dzd = subtotal + shipping.fee_dzd;
    await admin.from("order_items").update({ quantity: parsed.data.quantity }).eq("order_id", id);
  }

  const { error } = await admin.from("orders").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: "Modification impossible" }, { status: 500 });
  await admin.from("order_events").insert({
    order_id: id,
    actor_id: user.id,
    from_status: order.status,
    to_status: parsed.data.status,
    note: parsed.data.note ?? null,
  });
  return NextResponse.json({ ok: true });
}
