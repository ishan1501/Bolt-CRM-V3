"use client";

import { useState, useEffect } from "react";
import { TemplateSettings } from "@/components/ui/template-settings";
import { Settings, MessageSquare, Shield, Users, LogOut, Bell, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSettingsStore } from "@/stores/settings-store";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type Tab = "templates" | "security" | "team" | "notifications" | "appearance";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const [notifState, setNotifState] = useState<string>("default");

  const { notificationPreference, setNotificationPreference } = useSettingsStore();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifState(Notification.permission);
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifState(permission);
    if (permission === "granted") {
      new Notification("Notifications Enabled!", {
        body: "You'll now receive alerts for upcoming calls and power shots.",
        icon: "/icon.png",
      });
    }
  };

  const handleTestNotification = () => {
    const title = "Test Notification!";
    const body = "This is a test to verify your notifications are working perfectly.";
    if (notificationPreference === "both" || notificationPreference === "toast") {
      toast.success(title, { description: body, duration: 5000 });
    }
    if (
      (notificationPreference === "both" || notificationPreference === "os") &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(title, { body, icon: "/icon.png" });
    }
  };

  const NAV_ITEMS = [
    { id: "templates" as Tab,     label: "Templates",          Icon: MessageSquare },
    { id: "notifications" as Tab, label: "Notifications",      Icon: Bell },
    { id: "appearance" as Tab,    label: "Appearance",         Icon: Sun },
    { id: "security" as Tab,      label: "Security (Soon)",    Icon: Shield },
    { id: "team" as Tab,          label: "Team (Soon)",        Icon: Users },
  ];

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
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-3 shrink-0 md:shrink md:w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                  activeTab === id
                    ? "bg-[var(--bolt-accent)] text-black shadow-lg shadow-[var(--bolt-accent)]/20"
                    : "text-[var(--bolt-text-secondary)] hover:bg-[var(--bolt-bg-depth-2)] hover:text-[var(--bolt-text-primary)]"
                )}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
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

          {activeTab === "notifications" && (
            <div className="p-8">
              <div className="max-w-md">
                <h2 className="text-xl font-bold text-[var(--bolt-text-primary)] mb-2">Notification Settings</h2>
                <p className="text-sm text-[var(--bolt-text-secondary)] mb-8">
                  Get browser alerts for upcoming calls, power shots, and pacing reminders so you never miss a beat.
                </p>

                <div className="bg-[var(--bolt-bg-depth-2)] border border-[var(--bolt-border-color)] p-6 rounded-xl space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                        notifState === "granted" ? "bg-emerald-500/20 text-emerald-500" :
                        notifState === "denied"  ? "bg-rose-500/20 text-rose-500" :
                        "bg-amber-500/20 text-amber-500"
                      )}
                    >
                      <Bell size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--bolt-text-primary)]">Desktop Notifications</h3>
                      <p className="text-xs text-[var(--bolt-text-secondary)] mt-1">
                        Status: <span className="uppercase font-bold tracking-wider">{notifState}</span>
                      </p>
                    </div>
                  </div>

                  {notifState !== "granted" ? (
                    <button
                      onClick={handleEnableNotifications}
                      className="w-full py-2.5 rounded-lg bg-[var(--bolt-accent)] text-black text-sm font-medium hover:bg-[var(--bolt-accent-hover)] transition-colors"
                    >
                      Enable Notifications
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-full py-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-sm font-medium text-center">
                        OS Notifications are authorized
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="text-sm font-medium text-[var(--bolt-text-primary)]">Alert Preference</label>
                        <select
                          value={notificationPreference}
                          onChange={(e) => setNotificationPreference(e.target.value as any)}
                          className="w-full bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] rounded-lg px-3 py-2 text-sm text-[var(--bolt-text-primary)] focus:outline-none focus:border-[var(--bolt-accent)]"
                        >
                          <option value="both">Both (OS Banner + In-App Toast)</option>
                          <option value="os">OS Banners Only</option>
                          <option value="toast">In-App Toasts Only</option>
                        </select>
                      </div>

                      <button
                        onClick={handleTestNotification}
                        className="w-full py-2.5 rounded-lg bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)] hover:border-[var(--bolt-border-hover)] text-sm font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <Bell size={16} />
                        Send Test Notification
                      </button>
                    </div>
                  )}

                  {notifState === "denied" && (
                    <p className="text-xs text-rose-500 mt-2 text-center">
                      You have blocked notifications. Please click the lock icon in your browser URL bar to allow them.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="p-8">
              <div className="max-w-md">
                <h2 className="text-xl font-bold text-[var(--bolt-text-primary)] mb-2">Appearance</h2>
                <p className="text-sm text-[var(--bolt-text-secondary)] mb-8">
                  Choose how Bolt CRM looks for you. Your preference is saved across sessions.
                </p>

                <div className="bg-[var(--bolt-bg-depth-2)] border border-[var(--bolt-border-color)] p-6 rounded-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-[var(--bolt-accent)]/15 flex items-center justify-center shrink-0">
                      <Sun size={22} className="text-[var(--bolt-accent)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--bolt-text-primary)]">Theme</h3>
                      <p className="text-xs text-[var(--bolt-text-secondary)] mt-1">
                        Light uses a bright white canvas. Dark uses a deep black canvas. System follows your OS setting.
                      </p>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}

          {(activeTab !== "templates" && activeTab !== "notifications" && activeTab !== "appearance") && (
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
