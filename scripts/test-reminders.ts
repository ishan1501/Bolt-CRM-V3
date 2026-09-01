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
  const { data, error } = await supabaseAdmin.from("reminders").select("*").limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
}

check();
