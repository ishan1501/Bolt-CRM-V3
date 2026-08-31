import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

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
    const { userId, leadUuid, leadName, leadPhone } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Ensure user exists to prevent Foreign Key constraint errors
    await supabaseAdmin.from("users").upsert({ id: userId }, { onConflict: "id" });

    const { error } = await supabaseAdmin.from("call_logs").insert([
      {
        user_id: userId,
        lead_uuid: leadUuid,
        lead_name: leadName || "Unknown Lead",
        lead_phone: leadPhone || "Unknown Phone",
      }
    ]);

    if (error) {
      // Fallback in case user did not run the SQL command to add lead_name and lead_phone columns
      const { error: fallbackError } = await supabaseAdmin.from("call_logs").insert([
        { user_id: userId, lead_uuid: leadUuid }
      ]);
      if (fallbackError) {
        throw fallbackError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[log-call] Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
