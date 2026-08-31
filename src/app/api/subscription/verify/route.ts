import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createClient } from "@supabase/supabase-js";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

// Prefer service role key (bypasses RLS) — falls back to anon key if not set.
// For the anon key to work, the user_subscriptions table RLS policy must allow all.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Calculates when the subscription should expire:
 * - If there is an ACTIVE existing subscription, extend to end of the month
 *   following the current expiry (so renewing with 3 days left gives a full extra month).
 * - Otherwise (new user or expired), expire at end of the CURRENT calendar month.
 *
 * Examples (paying on Aug 15):
 *   New user          → Aug 31 23:59:59
 *   Renewing (exp Aug 31) → Sep 30 23:59:59
 */
function calculateExpiresAt(currentExpiresAt?: string | null): Date {
  const now = new Date();
  const currentExpiry = currentExpiresAt ? new Date(currentExpiresAt) : null;

  if (currentExpiry && currentExpiry > now) {
    // Active subscription — advance by one month from the current expiry
    const nextExpiry = new Date(
      currentExpiry.getFullYear(),
      currentExpiry.getMonth() + 2, // +1 for next month, +1 because day=0 gives last day of prev month
      0,
      23,
      59,
      59,
      999
    );
    return nextExpiry;
  }

  // New or expired — end of current calendar month
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay secret not configured" },
        { status: 500 }
      );
    }

    // ── Step 1: Verify HMAC-SHA256 signature ─────────────────────────────
    // Razorpay signs: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("[verify] Signature mismatch — possible tampered request");
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // ── Step 2: Fetch existing subscription to compute expiry ─────────────
    const { data: existing } = await supabaseAdmin
      .from("user_subscriptions")
      .select("expires_at")
      .eq("user_email", email)
      .maybeSingle();

    const expiresAt = calculateExpiresAt(existing?.expires_at);

    // ── Step 3: Upsert subscription record ───────────────────────────────
    const { error: dbError } = await supabaseAdmin
      .from("user_subscriptions")
      .upsert(
        {
          user_email: email,
          status: "active",
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          razorpay_payment_id,
          razorpay_order_id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_email" }
      );

    if (dbError) {
      console.error("[verify] Supabase upsert error:", dbError);
      return NextResponse.json(
        { error: "Payment verified but failed to activate subscription. Contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("[verify] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
