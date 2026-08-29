import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wcyykgrqvmbyutsoirjl.supabase.co";
const supabaseKey = "sb_publishable_VbLiFweivJHM2UmBtOO2uw_AO9x9Ujx";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: user, error: userErr } = await supabase.from("users").upsert({ id: "kamlesh" }, { onConflict: "id" });
  if (userErr) console.error("User err:", userErr);

  const { data, error } = await supabase.from("changelog").insert([{
    user_id: "kamlesh",
    action_type: "stage_changed",
    details: { name: "test", phone: "test", oldStage: "test", newStage: "test", lead_uuid: "test" }
  }]);
  
  if (error) console.error("Insert error:", error);
  else console.log("Insert success");

  const { data: logs, error: logsErr } = await supabase.from("changelog").select("*").limit(10);
  console.log("Logs in DB:", logs?.length);
}
run();
