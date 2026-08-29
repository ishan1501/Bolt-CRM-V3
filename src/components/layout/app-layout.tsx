"use client";

import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { BottomNav } from "./bottom-nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[var(--bolt-bg-depth-1)] text-[var(--bolt-text-primary)] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-x-hidden overflow-y-auto pb-24 md:pb-0">
          <main className="p-4 md:p-6 min-h-full relative flex flex-col">
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
