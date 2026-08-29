"use client";

import { LayoutDashboard, Users, FileText, Bookmark, Home, CheckSquare, PhoneCall } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

const NAV_ITEMS = [
  { icon: Users, label: "Leads", href: "/leads" },
  { icon: FileText, label: "Applications", href: "/applications" },
  { icon: Bookmark, label: "Saved Leads", href: "/saved-leads" },
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: Home, label: "Home", href: "/home" },
  { icon: CheckSquare, label: "To Do", href: "/planner" },
  { icon: PhoneCall, label: "All Calls", href: "/calls" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { selectedLeadIds } = useUIStore();
  
  // Hide navigation when bulk actions are active (user has selected leads)
  const isHidden = selectedLeadIds.size > 0;

  return (
    <div className={cn(
      "md:hidden fixed bottom-4 left-4 right-4 z-[60] flex justify-center pb-safe pointer-events-none transition-all duration-300",
      isHidden ? "translate-y-24 opacity-0" : "translate-y-0 opacity-100"
    )}>
      <nav className="pointer-events-auto bg-[#1a1a1a]/90 backdrop-blur-md border border-[var(--bolt-border-color)] rounded-[32px] p-2 flex items-center gap-1 shadow-2xl overflow-x-auto hide-scrollbar max-w-full">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center gap-2 h-12 transition-all duration-300 rounded-full",
                isActive 
                  ? "bg-gradient-to-r from-[#eab308] to-[#fde047] text-black px-5 shadow-[0_0_15px_rgba(234,179,8,0.3)]" 
                  : "text-[var(--bolt-text-secondary)] hover:text-white px-4 hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn("shrink-0", isActive && "text-black")} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="text-[13px] font-bold tracking-wide pr-1">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
