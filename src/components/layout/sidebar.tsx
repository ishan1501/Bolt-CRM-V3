"use client";

import { useUIStore } from "@/stores/ui-store";
import { LayoutDashboard, Users, FileText, Activity, Settings, Home, Bookmark, CheckSquare, PhoneCall, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const NAV_ITEMS = [
  { icon: Users, label: "Leads", href: "/leads" },
  { icon: FileText, label: "Applications", href: "/applications" },
  { icon: Bookmark, label: "Saved Leads", href: "/saved-leads" },
  { icon: LayoutDashboard, label: "Overview", href: "/overview" },
  { icon: Home, label: "Home", href: "/home" },
  { icon: CheckSquare, label: "To Do", href: "/planner" },
  { icon: PhoneCall, label: "All Calls", href: "/calls" },
];

export function Sidebar() {
  const { sidebarExpanded, setSidebarExpanded, mobileDrawerOpen, setMobileDrawerOpen } = useUIStore();
  const sidebarCollapsed = !sidebarExpanded;
  const setSidebarCollapsed = (collapsed: boolean) => setSidebarExpanded(!collapsed);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    // Clear all CRM local state
    localStorage.removeItem("bolt_auth_token");
    localStorage.removeItem("bolt_user");
    localStorage.removeItem("bolt-jobs");
    // End the Supabase session so the backend token is also invalidated
    await supabase.auth.signOut();
    router.push("/login");
  };

  const closeMobile = () => {
    if (window.innerWidth < 768) {
      setMobileDrawerOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Desktop space placeholder */}
      <div className="hidden md:block w-[80px] h-screen shrink-0 relative z-50" />

      {/* Actual Sidebar */}
      <aside
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className={cn(
          "fixed left-0 top-0 h-screen bg-[var(--bolt-bg-depth-2)]/95 backdrop-blur-xl border-r border-[var(--bolt-border-color)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col shadow-2xl z-50",
          mobileDrawerOpen ? "translate-x-0 w-[260px]" : "-translate-x-full md:translate-x-0",
          sidebarCollapsed ? "md:w-[80px]" : "md:w-[260px]"
        )}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-[var(--bolt-border-color)] overflow-hidden shrink-0">
          <div className="flex items-center justify-center shrink-0 w-8 h-8">
            <img src="/logo.png" alt="Masters Union" className="h-6 w-auto object-contain" />
          </div>
          <span 
            className={cn(
              "ml-3 font-bold text-lg tracking-tight whitespace-nowrap transition-opacity duration-300 text-[var(--bolt-text-primary)]",
              (sidebarCollapsed && !mobileDrawerOpen) ? "md:opacity-0" : "opacity-100"
            )}
          >
            Bolt CRM
          </span>
          {/* Mobile close button */}
          <button 
            className="md:hidden ml-auto p-1 text-[var(--bolt-text-secondary)] hover:text-white"
            onClick={() => setMobileDrawerOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  "flex items-center h-12 rounded-xl transition-all group/nav relative",
                  isActive
                    ? "bg-[var(--bolt-accent)]/10 text-[var(--bolt-accent)]"
                    : "text-[var(--bolt-text-secondary)] hover:bg-white/5 hover:text-[var(--bolt-text-primary)]"
                )}
              >
                <div className="w-[56px] h-full flex items-center justify-center shrink-0">
                  <item.icon size={20} className={cn("transition-colors", isActive ? "text-[var(--bolt-accent)]" : "group-hover/nav:text-[var(--bolt-text-primary)]")} />
                </div>
                <span 
                  className={cn(
                    "font-medium whitespace-nowrap transition-opacity duration-300", 
                    isActive && "text-[var(--bolt-accent)]",
                    (sidebarCollapsed && !mobileDrawerOpen) ? "md:opacity-0" : "opacity-100"
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--bolt-accent)] rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-[var(--bolt-border-color)] flex flex-col gap-2 shrink-0">
          <Link
            href="/settings"
            onClick={closeMobile}
            className={cn(
              "flex items-center h-12 rounded-xl transition-all group/nav relative",
              pathname === "/settings"
                ? "bg-[var(--bolt-accent)]/10 text-[var(--bolt-accent)]"
                : "text-[var(--bolt-text-secondary)] hover:bg-white/5 hover:text-[var(--bolt-text-primary)]"
            )}
          >
            <div className="w-[56px] h-full flex items-center justify-center shrink-0">
              <Settings size={20} className={cn("transition-colors", pathname === "/settings" ? "text-[var(--bolt-accent)]" : "group-hover/nav:text-[var(--bolt-text-primary)]")} />
            </div>
            <span 
              className={cn(
                "font-medium whitespace-nowrap transition-opacity duration-300",
                pathname === "/settings" && "text-[var(--bolt-accent)]",
                (sidebarCollapsed && !mobileDrawerOpen) ? "md:opacity-0" : "opacity-100"
              )}
            >
              Settings
            </span>
            {pathname === "/settings" && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--bolt-accent)] rounded-r-full" />
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
