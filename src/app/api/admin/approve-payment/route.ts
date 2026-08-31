import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, action } = body;

    if (!email || !action) {
      return NextResponse.json({ error: "Email and action are required" }, { status: 400 });
    }

    if (action === "approve") {
      const now = new Date();
      
      // Calculate the very last millisecond of the current month
      const expires = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const { error } = await supabaseAdmin
        .from("user_subscriptions")
        .update({
          status: "active",
          started_at: now.toISOString(),
          expires_at: expires.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("user_email", email);

      if (error) throw error;
    } else if (action === "reject") {
      const { error } = await supabaseAdmin
        .from("user_subscriptions")
        .update({
          status: "inactive",
          utr_number: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_email", email);

      if (error) throw error;
    } else if (action === "pause") {
      const { error } = await supabaseAdmin
        .from("user_subscriptions")
        .update({
          status: "paused",
          updated_at: new Date().toISOString(),
        })
        .eq("user_email", email);

      if (error) throw error;
    } else if (action === "resume") {
      const { error } = await supabaseAdmin
        .from("user_subscriptions")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("user_email", email);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[approve-payment] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
