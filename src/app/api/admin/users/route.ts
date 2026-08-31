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
    const { data: usersData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, total_calls_made")
      .order("created_at", { ascending: false });

    if (userError) throw userError;

    const { data: subsData, error: subError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("user_email, status, expires_at");
      
    if (subError) throw subError;

    const subsMap = (subsData || []).reduce((acc: any, sub: any) => {
      acc[sub.user_email] = sub;
      return acc;
    }, {});

    const usersWithSubs = (usersData || []).map((u: any) => ({
      ...u,
      email: u.id,
      subscription: subsMap[u.id] || null
    }));

    return NextResponse.json({ users: usersWithSubs });
  } catch (err: any) {
    console.error("[admin-users] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
