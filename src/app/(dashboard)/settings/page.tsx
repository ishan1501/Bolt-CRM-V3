"use client";

import { useState } from "react";
import { TemplateSettings } from "@/components/ui/template-settings";
import { SystemStatus } from "@/components/ui/system-status";
import { GlassCard } from "@/components/ui/glass-card";
import { Settings, MessageSquare, Zap, Bug, LogOut, Activity } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "system">("templates");

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Tab Nav — horizontal scrollable pills on mobile, vertical sidebar on md+ */}
        <div className="md:col-span-1">
          {/* Mobile: horizontal pill row */}
          <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 hide-scrollbar">
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex items-center gap-2 shrink-0 md:shrink md:w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "templates" 
                  ? "bg-[var(--bolt-accent)] text-black shadow-lg shadow-[var(--bolt-accent)]/20" 
                  : "text-[var(--bolt-text-secondary)] hover:bg-[var(--bolt-bg-depth-3)] hover:text-[var(--bolt-text-primary)]"
              }`}
            >
              <MessageSquare size={18} className="shrink-0" />
              Templates
            </button>
            


            <button
              onClick={() => setActiveTab("system")}
              className={`flex items-center gap-2 shrink-0 md:shrink md:w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "system" 
                  ? "bg-[var(--bolt-accent)] text-black shadow-lg shadow-[var(--bolt-accent)]/20" 
                  : "text-[var(--bolt-text-secondary)] hover:bg-[var(--bolt-bg-depth-3)] hover:text-[var(--bolt-text-primary)]"
              }`}
            >
              <Activity size={18} className="shrink-0" />
              System
            </button>

            {/* Sign out — hidden on mobile pill row, shown in desktop sidebar */}
            <div className="hidden md:block pt-6 mt-6 border-t border-[var(--bolt-border-color)]">
              <button
                onClick={() => {
                  localStorage.removeItem("bolt_auth_token");
                  localStorage.removeItem("bolt_user");
                  window.location.href = "/login";
                }}
                className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Mobile sign out — shown below the pill row */}
          <div className="md:hidden mt-3">
            <button
              onClick={() => {
                localStorage.removeItem("bolt_auth_token");
                localStorage.removeItem("bolt_user");
                window.location.href = "/login";
              }}
              className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-rose-500/20"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          <GlassCard className="p-6 md:p-8 min-h-[500px]">
            {activeTab === "templates" && <TemplateSettings />}
            {activeTab === "system" && <SystemStatus />}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
