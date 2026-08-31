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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Delete from user_subscriptions
    await supabaseAdmin.from("user_subscriptions").delete().eq("user_email", email);

    // Delete from call_logs
    await supabaseAdmin.from("call_logs").delete().eq("user_id", email);

    // Delete from users (since id is the email)
    const { error } = await supabaseAdmin.from("users").delete().eq("id", email);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[delete-user] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
