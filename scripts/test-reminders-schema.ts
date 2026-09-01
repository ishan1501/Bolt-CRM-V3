import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// parse .env.local
const env = fs.readFileSync(".env.local", "utf-8").split("\n").reduce((acc, line) => {
  if (line.includes("=")) {
    const [key, ...rest] = line.split("=");
    acc[key.trim()] = rest.join("=").trim();
  }
  return acc;
}, {} as Record<string, string>);

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL!,
  env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // We can just try to insert a dummy row and catch the error to see what column fails,
  // or use the REST API to query the columns (though REST doesn't easily expose schema info without pg_meta).
  // Actually, we can just insert a row and delete it.
  const { data, error } = await supabaseAdmin.from("reminders").insert({
    id: "test-id-123",
    user_id: "test",
    lead_uuid: "test",
    lead_name: "test",
    title: "test",
    date: new Date().toISOString(),
    completed: false
  }).select();
  
  console.log("Insert Error:", error);
  if (!error) {
    await supabaseAdmin.from("reminders").delete().eq("id", "test-id-123");
    console.log("Schema matches perfectly!");
  }
}

check();
