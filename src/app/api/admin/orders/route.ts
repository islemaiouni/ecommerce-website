import { NextResponse } from "next/server";
import { createServerSupabase } from "@/infrastructure/supabase/server";
import { createAdminSupabase } from "@/infrastructure/supabase/admin";

export async function GET() {
  const supabaseAuth = await createServerSupabase();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: profile } = await supabaseAuth
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const admin = createAdminSupabase();
  const { data, error } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
  return NextResponse.json(data ?? []);
}
