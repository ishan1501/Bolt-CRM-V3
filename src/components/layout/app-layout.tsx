"use client";

import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { BottomNav } from "./bottom-nav";
import { SubscriptionBanner } from "./subscription-banner";
import { PullToRefresh } from "./pull-to-refresh";
import { motion, AnimatePresence } from "framer-motion";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useUIStore } from "@/stores/ui-store";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProfilePage = pathname === "/profile";

  // Use a ref to track the last "real" route so that spoofing the URL to a deep-link 
  // (e.g. /leads/123) doesn't trigger a full page fade transition for the underlying table.
  const lastRealRoute = useRef(pathname);

  useEffect(() => {
    const isDeepLink = /^\/leads\/[a-f0-9-]+$/.test(pathname);
    if (!isDeepLink) {
      lastRealRoute.current = pathname;
    }
  }, [pathname]);

  const animationKey = /^\/leads\/[a-f0-9-]+$/.test(pathname) ? lastRealRoute.current : pathname;

  // Reset drawer state when the user navigates away to a new base page
  useEffect(() => {
    useUIStore.getState().closeDrawer();
  }, [animationKey]);

  return (
    <div className="min-h-screen flex bg-[var(--bolt-bg-depth-1)] text-[var(--bolt-text-primary)] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
        <TopBar />
        {/* Renewal reminder — only visible when ≤5 days remain on subscription */}
        <SubscriptionBanner />
        <PullToRefresh>
          <main className="p-4 md:p-6 min-h-full relative flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={animationKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex-1 flex flex-col"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </PullToRefresh>
      </div>
      <BottomNav />
    </div>
  );
}
