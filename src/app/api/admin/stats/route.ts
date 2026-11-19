import { NextResponse } from "next/server";
import { createServerSupabase } from "@/infrastructure/supabase/server";
import { createAdminSupabase } from "@/infrastructure/supabase/admin";

export async function GET() {
  const auth = await createServerSupabase();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { data: profile } = await auth.from("admin_profiles").select("role").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const admin = createAdminSupabase();
  const { data: orders } = await admin.from("orders").select("status,total_dzd,wilaya_code,created_at");
  const list = orders ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = list.filter((order) => order.created_at.slice(0, 10) === today);
  const confirmed = list.filter((order) => !["new","calling","no_answer"].includes(order.status)).length;
  const deliveredOrders = list.filter((order) => order.status === "delivered");

  const byDay = new Map<string, number>();
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    byDay.set(date.toISOString().slice(0, 10), 0);
  }
  list.forEach((order) => {
    const day = order.created_at.slice(0, 10);
    if (byDay.has(day)) byDay.set(day, (byDay.get(day) ?? 0) + 1);
  });

  const wilayas = new Map<number, number>();
  list.forEach((order) => wilayas.set(order.wilaya_code, (wilayas.get(order.wilaya_code) ?? 0) + 1));
  const topWilayas = [...wilayas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return NextResponse.json({
    ordersToday: todayOrders.length,
    confirmationRate: list.length ? Math.round((confirmed / list.length) * 100) : 0,
    deliveredRate: list.length ? Math.round((deliveredOrders.length / list.length) * 100) : 0,
    revenueCod: deliveredOrders.reduce((sum, order) => sum + order.total_dzd, 0),
    byDay: [...byDay.entries()].map(([date, count]) => ({ date, count })),
    topWilayas: topWilayas.map(([wilayaCode, count]) => ({ wilayaCode, count })),
  });
}
