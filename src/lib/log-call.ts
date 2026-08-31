export const logCallToSupabase = async (leadUuid: string, leadName?: string, leadPhone?: string) => {
  try {
    const user = JSON.parse(localStorage.getItem("bolt_user") || "{}");
    const userId = user.email || user.id;

    if (!userId) {
      console.error("No user found to log call");
      return;
    }

    const res = await fetch("/api/log-call", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, leadUuid, leadName, leadPhone }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Critical error logging call:", errorData);
    } else {
      console.log("Call logged to Supabase securely via API.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("bolt_call_logged"));
      }
    }
  } catch (err) {
    console.error("Failed to log call:", err);
  }
};
