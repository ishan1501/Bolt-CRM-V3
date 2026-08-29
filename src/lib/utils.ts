import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BADGE_COLORS = [
  "bg-[#1a1a1a] text-blue-400 border border-blue-500/30",
  "bg-[#1a1a1a] text-emerald-400 border border-emerald-500/30",
  "bg-[#1a1a1a] text-indigo-400 border border-indigo-500/30",
  "bg-[#1a1a1a] text-violet-400 border border-violet-500/30",
  "bg-[#1a1a1a] text-fuchsia-400 border border-fuchsia-500/30",
  "bg-[#1a1a1a] text-rose-400 border border-rose-500/30",
  "bg-[#1a1a1a] text-orange-400 border border-orange-500/30",
  "bg-[#1a1a1a] text-amber-400 border border-amber-500/30",
  "bg-[#1a1a1a] text-cyan-400 border border-cyan-500/30",
  "bg-[#1a1a1a] text-teal-400 border border-teal-500/30",
  "bg-[#1a1a1a] text-sky-400 border border-sky-500/30",
  "bg-[#1a1a1a] text-pink-400 border border-pink-500/30",
  "bg-[#1a1a1a] text-lime-400 border border-lime-500/30",
];

export function getBadgeColor(text: string) {
  if (!text || text === "NA" || text === "-" || text === "Unknown") {
    return "bg-[#1a1a1a] text-[#888888] border border-[#333333]";
  }

  const t = text.toLowerCase();

  // 1. Success / Positive / Converted
  if (t.includes("done") || t.includes("enroll") || t.includes("admit") || t.includes("success") || t.includes("paid") || t.includes("quality") || t.includes("offer") || t.includes("win") || t.includes("won")) {
    return "bg-[#1a1a1a] text-emerald-400 border border-emerald-500/30";
  }
  
  // 2. High Intent / Hot
  if (t.includes("hot") || t.includes("high") || t.includes("priority") || t.includes("urgent")) {
    return "bg-[#1a1a1a] text-rose-400 border border-rose-500/30";
  }
  
  // 3. Medium Intent / Warm / In Progress
  if (t.includes("warm") || t.includes("interested") || t.includes("progress") || t.includes("discussion") || t.includes("negotiation") || t.includes("nurture")) {
    return "bg-[#1a1a1a] text-orange-400 border border-orange-500/30";
  }
  
  // 4. Low Intent / Cold / New / Fresh
  if (t.includes("cold") || t.includes("new") || t.includes("fresh") || t.includes("unassigned") || t.includes("raw") || t.includes("prospect")) {
    return "bg-[#1a1a1a] text-blue-400 border border-blue-500/30";
  }
  
  // 5. Negative / Lost / Dead / Invalid
  if (t.includes("dead") || t.includes("drop") || t.includes("reject") || t.includes("not interested") || t.includes("churn") || t.includes("dnd") || t.includes("lost") || t.includes("junk") || t.includes("spam") || t.includes("invalid") || t.includes("cancel")) {
    return "bg-[#1a1a1a] text-red-400 border border-red-500/30";
  }
  
  // 6. Action / Follow up / Communication / Meeting
  if (t.includes("whatsapp") || t.includes("call") || t.includes("chat") || t.includes("contact") || t.includes("meeting") || t.includes("schedule") || t.includes("appointment") || t.includes("follow up") || t.includes("callback")) {
    return "bg-[#1a1a1a] text-teal-400 border border-teal-500/30";
  }
  
  // 7. No Response / RNR / Unreachable
  if (t.includes("rnr") || t.includes("no response") || t.includes("unreachable") || t.includes("voicemail") || t.includes("bounce")) {
    return "bg-[#1a1a1a] text-violet-400 border border-violet-500/30";
  }

  // 8. Wait / Pending / Review / Hold
  if (t.includes("pending") || t.includes("wait") || t.includes("review") || t.includes("hold") || t.includes("verify") || t.includes("eval")) {
    return "bg-[#1a1a1a] text-[#f9c851] border border-[#f9c851]/40";
  }

  // 9. Process / Stage names (like PDE, Interview, Application)
  if (t.includes("pde") || t.includes("p1") || t.includes("p2") || t.includes("interview") || t.includes("application") || t.includes("form") || t.includes("test") || t.includes("exam") || t.includes("assess")) {
    return "bg-[#1a1a1a] text-indigo-400 border border-indigo-500/30";
  }

  // Fallback to hashing algorithm for anything else
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length];
}
