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
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email query param is required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("user_subscriptions")
      .select("status, expires_at, started_at")
      .eq("user_email", email)
      .maybeSingle();

    // No record found → user has never paid
    if (error || !data) {
      return NextResponse.json({
        status: "inactive",
        daysLeft: 0,
        expiresAt: null,
      });
    }

    // If pending or paused, just return it immediately
    if (data.status === "pending" || data.status === "paused") {
      return NextResponse.json({
        status: data.status,
        daysLeft: 0,
        expiresAt: data.expires_at,
      });
    }

    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    // Subscription has expired (status may still say 'active' in DB)
    if (expiresAt <= now) {
      return NextResponse.json({
        status: "expired",
        daysLeft: 0,
        expiresAt: data.expires_at,
      });
    }

    const msLeft = expiresAt.getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      status: "active",
      daysLeft,
      expiresAt: data.expires_at,
    });
  } catch (err) {
    console.error("[subscription/status] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
