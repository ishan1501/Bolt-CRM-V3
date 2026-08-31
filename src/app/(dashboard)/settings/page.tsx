"use client";

import { useState } from "react";
import { TemplateSettings } from "@/components/ui/template-settings";
import { Settings, MessageSquare, Zap, Shield, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "security" | "team">("templates");

  return (
    <div className="w-full h-full flex flex-col pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bolt-bg-depth-2)] flex items-center justify-center shadow-sm border border-[var(--bolt-border-color)]">
            <Settings size={24} className="text-[var(--bolt-accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--bolt-text-primary)]">Settings</h1>
            <p className="text-sm text-[var(--bolt-text-secondary)]">Manage your preferences, templates, and automations.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* Settings Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 hide-scrollbar">
            <button
              onClick={() => setActiveTab("templates")}
              className={cn(
                "flex items-center gap-3 shrink-0 md:shrink md:w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                activeTab === "templates" 
                  ? "bg-[var(--bolt-accent)] text-black shadow-lg shadow-[var(--bolt-accent)]/20" 
                  : "text-[var(--bolt-text-secondary)] hover:bg-[var(--bolt-bg-depth-2)] hover:text-[var(--bolt-text-primary)]"
              )}
            >
              <MessageSquare size={18} />
              Templates
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={cn(
                "flex items-center gap-3 shrink-0 md:shrink md:w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                activeTab === "security" 
                  ? "bg-[var(--bolt-accent)] text-black shadow-lg shadow-[var(--bolt-accent)]/20" 
                  : "text-[var(--bolt-text-secondary)] hover:bg-[var(--bolt-bg-depth-2)] hover:text-[var(--bolt-text-primary)]"
              )}
            >
              <Shield size={18} />
              Security (Coming Soon)
            </button>
            <button
              onClick={() => setActiveTab("team")}
              className={cn(
                "flex items-center gap-3 shrink-0 md:shrink md:w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                activeTab === "team" 
                  ? "bg-[var(--bolt-accent)] text-black shadow-lg shadow-[var(--bolt-accent)]/20" 
                  : "text-[var(--bolt-text-secondary)] hover:bg-[var(--bolt-bg-depth-2)] hover:text-[var(--bolt-text-primary)]"
              )}
            >
              <Users size={18} />
              Team (Coming Soon)
            </button>
          </div>

          <div className="hidden md:block mt-auto pt-4 border-t border-[var(--bolt-border-color)]">
            <button
              onClick={() => {
                localStorage.removeItem("bolt_auth_token");
                localStorage.removeItem("bolt_user");
                window.location.href = "/login";
              }}
              className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--bolt-bg-depth-1)] rounded-2xl border border-[var(--bolt-border-color)] overflow-hidden shadow-sm">
          {activeTab === "templates" && <TemplateSettings />}
          {activeTab !== "templates" && (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--bolt-text-secondary)]">
              <Settings size={48} className="mb-4 opacity-20" />
              <p>This settings section is coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
