import { supabase } from "./supabase";

export const logCallToSupabase = async (leadUuid: string, leadName?: string, leadPhone?: string) => {
  try {
    const user = JSON.parse(localStorage.getItem("bolt_user") || "{}");
    const userId = user.email || user.id;

    if (!userId) {
      console.error("No user found to log call");
      return;
    }

    // Ensure user exists to prevent Foreign Key constraint errors
    await supabase.from("users").upsert({ id: userId }, { onConflict: "id" });

    const { error } = await supabase.from("call_logs").insert([
      {
        user_id: userId,
        lead_uuid: leadUuid,
        lead_name: leadName || "Unknown Lead",
        lead_phone: leadPhone || "Unknown Phone",
      }
    ]);

    if (error) {
      console.error("Error logging call with name/phone, trying fallback:", error);
      // Fallback in case user did not run the SQL command to add lead_name and lead_phone columns
      const { error: fallbackError } = await supabase.from("call_logs").insert([
        { user_id: userId, lead_uuid: leadUuid }
      ]);
      if (fallbackError) {
        console.error("Critical error logging call:", fallbackError);
      } else {
        console.warn("Call logged using fallback. Please run the SQL command to add lead_name and lead_phone to call_logs.");
      }
    } else {
      console.log("Call logged to Supabase successfully.");
    }
  } catch (err) {
    console.error("Failed to log call:", err);
  }
};
