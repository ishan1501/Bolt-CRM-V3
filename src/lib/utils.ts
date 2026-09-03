import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BADGE_COLORS = [
  "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800/60",
  "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60",
  "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800/60",
  "bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-800/60",
  "bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-800 dark:text-fuchsia-300 border border-fuchsia-300 dark:border-fuchsia-800/60",
  "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60",
  "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800/60",
  "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60",
  "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800/60",
  "bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800/60",
  "bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800/60",
  "bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-300 border border-pink-300 dark:border-pink-800/60",
  "bg-lime-100 dark:bg-lime-900/50 text-lime-800 dark:text-lime-300 border border-lime-300 dark:border-lime-800/60",
];

export function getBadgeColor(text: string) {
  if (!text || text === "NA" || text === "-" || text === "Unknown") {
    return "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700";
  }

  const t = text.toLowerCase();

  // 1. Success / Positive / Converted
  if (t.includes("done") || t.includes("enroll") || t.includes("admit") || t.includes("success") || t.includes("paid") || t.includes("quality") || t.includes("offer") || t.includes("win") || t.includes("won")) {
    return "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60";
  }
  
  // 2. High Intent / Hot
  if (t.includes("hot") || t.includes("high") || t.includes("priority") || t.includes("urgent")) {
    return "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60";
  }
  
  // 3. Medium Intent / Warm / In Progress
  if (t.includes("warm") || t.includes("interested") || t.includes("progress") || t.includes("discussion") || t.includes("negotiation") || t.includes("nurture")) {
    return "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800/60";
  }
  
  // 4. Low Intent / Cold / New / Fresh
  if (t.includes("cold") || t.includes("new") || t.includes("fresh") || t.includes("unassigned") || t.includes("raw") || t.includes("prospect")) {
    return "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800/60";
  }
  
  // 5. Negative / Lost / Dead / Invalid
  if (t.includes("dead") || t.includes("drop") || t.includes("reject") || t.includes("not interested") || t.includes("churn") || t.includes("dnd") || t.includes("lost") || t.includes("junk") || t.includes("spam") || t.includes("invalid") || t.includes("cancel")) {
    return "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800/60";
  }
  
  // 6. Action / Follow up / Communication / Meeting
  if (t.includes("whatsapp") || t.includes("call") || t.includes("chat") || t.includes("contact") || t.includes("meeting") || t.includes("schedule") || t.includes("appointment") || t.includes("follow up") || t.includes("callback")) {
    return "bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800/60";
  }
  
  // 7. No Response / RNR / Unreachable
  if (t.includes("rnr") || t.includes("no response") || t.includes("unreachable") || t.includes("voicemail") || t.includes("bounce")) {
    return "bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-800/60";
  }

  // 8. Wait / Pending / Review / Hold
  if (t.includes("pending") || t.includes("wait") || t.includes("review") || t.includes("hold") || t.includes("verify") || t.includes("eval")) {
    return "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60";
  }

  // 9. Process / Stage names (like PDE, Interview, Application)
  if (t.includes("pde") || t.includes("p1") || t.includes("p2") || t.includes("interview") || t.includes("application") || t.includes("form") || t.includes("test") || t.includes("exam") || t.includes("assess")) {
    return "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800/60";
  }

  // Fallback to hashing algorithm for anything else
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
}
