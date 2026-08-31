import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { persistSession: false },
    global: { fetch: (url, init) => fetch(url, { ...init, cache: 'no-store' }) }
  }
);

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_subscriptions")
      .select("*")
      .in("status", ["pending", "active", "paused"])
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ approvals: data || [] });
  } catch (err: any) {
    console.error("[pending-approvals] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
