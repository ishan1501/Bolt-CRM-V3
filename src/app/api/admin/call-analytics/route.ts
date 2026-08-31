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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Opportunistic Auto-Cleanup (Fire and forget, do not await/block)
    Promise.all([
      supabaseAdmin.from("call_logs").delete().lt("created_at", sevenDaysAgo.toISOString()),
      supabaseAdmin.from("todos").delete().lt("created_at", sevenDaysAgo.toISOString())
    ]).catch(err => console.error("[Auto-Cleanup Failed]", err));

    // 2. Fetch raw logs (only the last 7 days since older ones are deleted)
    const { data: logs, error: logsError } = await supabaseAdmin
      .from("call_logs")
      .select("user_id, created_at")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (logsError) throw logsError;

    // 3. Fetch aggregated stats (for the 30-day view)
    const { data: stats, error: statsError } = await supabaseAdmin
      .from("daily_user_stats")
      .select("date, user_id, calls_count")
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false });
      
    // If table doesn't exist yet (e.g. user hasn't run the SQL), safely ignore
    if (statsError && statsError.code !== '42P01') { 
       console.error("[Stats Error]", statsError);
    }

    // 4. Get users map
    const { data: usersData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id");

    const usersMap = (usersData || []).reduce((acc: any, u: any) => {
      acc[u.id] = u.id; // since id is the email
      return acc;
    }, {});

    return NextResponse.json({ 
      logs: logs || [], 
      stats: stats || [], 
      users: usersMap 
    });
  } catch (err: any) {
    console.error("[call-analytics] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
