import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false }, global: { fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }) } }
);

export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // NOTE: Auto-cleanup has been removed from this GET route.
    // Data deletion should be handled by a scheduled cron job, not on every page load.

    const { data: logs, error: logsError } = await supabaseAdmin
      .from("call_logs")
      .select("user_id, created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (logsError) throw logsError;

    const { data: stats, error: statsError } = await supabaseAdmin
      .from("daily_user_stats")
      .select("date, user_id, calls_count")
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (statsError && statsError.code !== "42P01") {
      console.error("[Stats Error]", statsError);
    }

    const { data: usersData } = await supabaseAdmin
      .from("users")
      .select("id");

    const usersMap = (usersData || []).reduce((acc: Record<string, string>, u: any) => {
      acc[u.id] = u.id;
      return acc;
    }, {});

    return NextResponse.json({
      logs: logs || [],
      stats: stats || [],
      users: usersMap,
    });
  } catch (err: any) {
    console.error("[call-analytics] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
