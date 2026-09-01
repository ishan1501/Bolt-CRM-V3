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
    const { action, userId, reminder, id } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Ensure user exists
    await supabaseAdmin.from("users").upsert({ id: userId }, { onConflict: "id" });

    if (action === "delete") {
      const { error } = await supabaseAdmin
        .from("reminders")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "upsert" && reminder) {
      const { error } = await supabaseAdmin.from("reminders").upsert({
        id: reminder.id,
        user_id: userId,
        lead_uuid: reminder.leadUuid,
        lead_name: reminder.leadName,
        title: reminder.title,
        date: reminder.date,
        completed: reminder.completed,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });
      
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[reminders-api] Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("reminders")
      .select("*")
      .eq("user_id", userId);
      
    if (error) throw error;

    const mapped = (data || []).map((r: any) => ({
      id: r.id,
      leadUuid: r.lead_uuid,
      leadName: r.lead_name,
      title: r.title,
      date: r.date,
      completed: r.completed
    }));

    return NextResponse.json({ reminders: mapped });
  } catch (err: any) {
    console.error("[reminders-api] GET Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
