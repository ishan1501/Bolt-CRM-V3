import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, utr } = body;

    if (!email || !utr) {
      return NextResponse.json({ error: "Email and UTR are required" }, { status: 400 });
    }

    // Upsert the user_subscriptions row
    const { error } = await supabaseAdmin
      .from("user_subscriptions")
      .upsert(
        {
          user_email: email,
          status: "pending",
          utr_number: utr,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_email" }
      );

    if (error) {
      console.error("[submit-utr] DB Error:", error);
      return NextResponse.json({ error: "Failed to submit UTR" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[submit-utr] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
