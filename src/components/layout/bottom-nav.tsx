"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./sidebar";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--bolt-bg-depth-2)]/90 backdrop-blur-xl border-t border-[var(--bolt-border-color)] z-40 flex items-center px-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
      <div className="w-full h-full flex items-center overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory">
        <div className="flex items-center gap-1 min-w-max px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-[72px] h-16 rounded-2xl transition-all duration-300 snap-center relative",
                  isActive
                    ? "text-[var(--bolt-accent)]"
                    : "text-[var(--bolt-text-secondary)] hover:bg-white/5 hover:text-[var(--bolt-text-primary)]"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-[var(--bolt-accent)]/10 rounded-2xl scale-100 animate-in zoom-in-90 duration-300" />
                )}
                <item.icon size={22} className={cn("mb-1 relative z-10 transition-transform duration-300", isActive && "-translate-y-0.5")} />
                <span className="text-[10px] font-medium text-center leading-tight relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
