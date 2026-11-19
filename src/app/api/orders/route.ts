import { NextRequest, NextResponse } from "next/server";
import { orderSchema } from "@/features/orders/schemas/order";
import { createAdminSupabase } from "@/infrastructure/supabase/admin";
import { isRateLimited } from "@/infrastructure/rate-limiter";
import { calculateOrderTotal } from "@/domain/pricing";

export async function POST(request: NextRequest) {
  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  if (input.honeypot) {
    return NextResponse.json({ error: "Requête refusée" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`ip:${ip}`) || isRateLimited(`phone:${input.phone}`)) {
    return NextResponse.json({ error: "Trop de demandes, veuillez réessayer." }, { status: 429 });
  }

  const supabase = createAdminSupabase();
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: duplicate } = await supabase
    .from("orders")
    .select("id")
    .eq("customer_phone", input.phone)
    .gte("created_at", tenMinutesAgo)
    .limit(1);
  if (duplicate?.length) {
    return NextResponse.json(
      { error: "Une commande similaire existe déjà pour ce numéro." },
      { status: 409 },
    );
  }

  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select("id, product_id, size_ml, price_dzd, stock")
    .eq("id", input.variantId)
    .eq("active", true)
    .single();
  if (variantError || !variant || variant.stock < input.quantity) {
    return NextResponse.json({ error: "Produit indisponible." }, { status: 409 });
  }

  const { data: shipping, error: shippingError } = await supabase
    .from("shipping_rates")
    .select("fee_dzd")
    .eq("wilaya_code", input.wilayaCode)
    .eq("delivery_type", input.deliveryType)
    .single();
  if (shippingError || !shipping) {
    return NextResponse.json({ error: "Frais de livraison indisponibles." }, { status: 409 });
  }

  const totals = calculateOrderTotal({
    unitPriceDzd: variant.price_dzd,
    quantity: input.quantity,
    shippingFeeDzd: shipping.fee_dzd,
  });
  const orderNumber = `SL-${Date.now().toString(36).toUpperCase()}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: input.customerName,
      customer_phone: input.phone,
      wilaya_code: input.wilayaCode,
      commune: input.commune,
      address: input.address,
      delivery_type: input.deliveryType,
      subtotal_dzd: totals.subtotalDzd,
      shipping_dzd: totals.shippingDzd,
      total_dzd: totals.totalDzd,
    })
    .select("id")
    .single();
  if (orderError || !order) {
    return NextResponse.json({ error: "Impossible de créer la commande." }, { status: 500 });
  }

  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: variant.product_id,
    variant_id: variant.id,
    product_name: "Sultan parfum",
    size_ml: variant.size_ml,
    quantity: input.quantity,
    unit_price_dzd: variant.price_dzd,
  });
  if (itemError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Impossible d'enregistrer les articles." }, { status: 500 });
  }

  const { data: reserved, error: reserveError } = await supabase.rpc(
    "reserve_variant_stock",
    { variant_id: input.variantId, quantity: input.quantity },
  );
  if (reserveError || reserved !== true) {
    await supabase.from("order_items").delete().eq("order_id", order.id);
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Stock indisponible." }, { status: 409 });
  }

  await supabase.from("order_events").insert({
    order_id: order.id,
    to_status: "new",
    note: "Commande créée depuis la boutique",
  });

  return NextResponse.json({
    orderNumber,
    totals,
  });
}
