"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users, FileText, Bookmark, CheckSquare, PhoneCall, Wrench } from "lucide-react";

const MOBILE_NAV_ITEMS = [
  { icon: Users,       label: "Leads",       href: "/leads" },
  { icon: FileText,    label: "Applications", href: "/applications" },
  { icon: Bookmark,    label: "Saved Leads",  href: "/saved-leads" },
  { icon: CheckSquare, label: "To Do",        href: "/planner" },
  { icon: PhoneCall,   label: "All Calls",    href: "/calls" },
  { icon: Wrench,      label: "Tools",        href: "/tools" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bolt-bg-depth-2)] backdrop-blur-xl border-t border-[var(--bolt-border-color)] z-40 flex items-center px-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="w-full flex items-center justify-between gap-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 relative",
                isActive
                  ? "text-[var(--bolt-accent)]"
                  : "text-[var(--bolt-text-secondary)] hover:bg-[var(--bolt-hover-overlay)] hover:text-[var(--bolt-text-primary)]"
              )}
              title={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-[var(--bolt-accent)]/10 rounded-xl"
                />
              )}
              <item.icon
                size={22}
                className={cn("relative z-10 transition-transform duration-300", isActive && "scale-110")}
              />
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
