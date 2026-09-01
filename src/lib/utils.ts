import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BADGE_COLORS = [
  "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20",
  "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
  "bg-teal-500/10 text-teal-400 border border-teal-500/20",
  "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  "bg-pink-500/10 text-pink-400 border border-pink-500/20",
  "bg-lime-500/10 text-lime-400 border border-lime-500/20",
];

export function getBadgeColor(text: string) {
  if (!text || text === "NA" || text === "-" || text === "Unknown") {
    return "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20";
  }

  const t = text.toLowerCase();

  // 1. Success / Positive / Converted
  if (t.includes("done") || t.includes("enroll") || t.includes("admit") || t.includes("success") || t.includes("paid") || t.includes("quality") || t.includes("offer") || t.includes("win") || t.includes("won")) {
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  }
  
  // 2. High Intent / Hot
  if (t.includes("hot") || t.includes("high") || t.includes("priority") || t.includes("urgent")) {
    return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  }
  
  // 3. Medium Intent / Warm / In Progress
  if (t.includes("warm") || t.includes("interested") || t.includes("progress") || t.includes("discussion") || t.includes("negotiation") || t.includes("nurture")) {
    return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
  }
  
  // 4. Low Intent / Cold / New / Fresh
  if (t.includes("cold") || t.includes("new") || t.includes("fresh") || t.includes("unassigned") || t.includes("raw") || t.includes("prospect")) {
    return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  }
  
  // 5. Negative / Lost / Dead / Invalid
  if (t.includes("dead") || t.includes("drop") || t.includes("reject") || t.includes("not interested") || t.includes("churn") || t.includes("dnd") || t.includes("lost") || t.includes("junk") || t.includes("spam") || t.includes("invalid") || t.includes("cancel")) {
    return "bg-red-500/10 text-red-400 border border-red-500/20";
  }
  
  // 6. Action / Follow up / Communication / Meeting
  if (t.includes("whatsapp") || t.includes("call") || t.includes("chat") || t.includes("contact") || t.includes("meeting") || t.includes("schedule") || t.includes("appointment") || t.includes("follow up") || t.includes("callback")) {
    return "bg-teal-500/10 text-teal-400 border border-teal-500/20";
  }
  
  // 7. No Response / RNR / Unreachable
  if (t.includes("rnr") || t.includes("no response") || t.includes("unreachable") || t.includes("voicemail") || t.includes("bounce")) {
    return "bg-violet-500/10 text-violet-400 border border-violet-500/20";
  }

  // 8. Wait / Pending / Review / Hold
  if (t.includes("pending") || t.includes("wait") || t.includes("review") || t.includes("hold") || t.includes("verify") || t.includes("eval")) {
    return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  }

  // 9. Process / Stage names (like PDE, Interview, Application)
  if (t.includes("pde") || t.includes("p1") || t.includes("p2") || t.includes("interview") || t.includes("application") || t.includes("form") || t.includes("test") || t.includes("exam") || t.includes("assess")) {
    return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
  }

  // Fallback to hashing algorithm for anything else
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
}
