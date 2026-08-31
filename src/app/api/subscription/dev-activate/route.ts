import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ── DEV BYPASS endpoint ──────────────────────────────────────────────────────
// Activates subscription directly in DB without real payment.
// Only callable in development (NODE_ENV !== 'production').
// DELETE or gate this properly before deploying to production.

function calculateExpiresAt(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const expiresAt = calculateExpiresAt();

  const { error } = await supabase.from("user_subscriptions").upsert(
    {
      user_email: email,
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      razorpay_payment_id: "dev_bypass",
      razorpay_order_id: "dev_bypass",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_email" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, expiresAt: expiresAt.toISOString() });
}
