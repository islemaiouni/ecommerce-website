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
  const { data } = await admin.from("orders").select("*").order("created_at", { ascending: false });
  const lines = [
    ["number","name","phone","wilaya","commune","address","delivery","status","total","tracking","created_at"].join(","),
    ...(data ?? []).map((order) => [
      order.order_number, order.customer_name, order.customer_phone, order.wilaya_code,
      order.commune, order.address, order.delivery_type, order.status, order.total_dzd,
      order.tracking_number ?? "", order.created_at,
    ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")),
  ];
  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="orders.csv"',
    },
  });
}
