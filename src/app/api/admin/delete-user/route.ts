import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminAuth } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Soft-delete: mark as deleted rather than destroying data
    await supabaseAdmin.from("user_subscriptions").update({ status: "deleted", updated_at: new Date().toISOString() }).eq("user_email", email);
    await supabaseAdmin.from("call_logs").delete().eq("user_id", email);

    const { error } = await supabaseAdmin.from("users").delete().eq("id", email);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[delete-user] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
