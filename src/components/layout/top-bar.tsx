"use client";

import { Bell, Search, Loader2, CheckCircle2, Play, Pause, X, Menu, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect, useMemo } from "react";

import { useReminderStore } from "@/stores/reminder-store";
import { useUIStore } from "@/stores/ui-store";
import { useJobStore } from "@/stores/job-store";
import { usePathname } from "next/navigation";
import { GlassCard } from "../ui/glass-card";
import { supabase } from "@/lib/supabase";

export function TopBar() {
  const { reminders } = useReminderStore();
  const { searchQuery, setSearchQuery } = useUIStore();
  const { jobs, pauseJob, startJob, removeJob } = useJobStore();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Dynamically get logged-in user initials
  const userInitials = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("bolt_user") || "{}");
      const name: string = user.name || user.email || "";
      if (!name) return "?";
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    } catch {
      return "?";
    }
  }, []);

  const isLeadsPage = pathname === "/leads" || pathname === "/applications";
  const isProfilePage = pathname === "/profile";
  const upcomingCount = reminders.filter(r => !r.completed && new Date(r.date) >= new Date()).length;
  const activeJobsCount = jobs.filter(j => j.status === 'running').length;
  
  const totalNotifications = upcomingCount + activeJobsCount;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Request Notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Check for upcoming calls to fire notifications
  useEffect(() => {
    const notified5m = new Set<string>();
    const notified1m = new Set<string>();
    
    // Pace and Power Shot tracking
    const notifiedPowerShots = new Set<string>();
    let lastPaceCheck = 0;

    const checkReminders = async () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;

      const now = new Date();
      
      // 1. Regular Call Reminders
      reminders.filter(r => !r.completed).forEach(r => {
        const callTime = new Date(r.date);
        const diffMs = callTime.getTime() - now.getTime();
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins === 5 && !notified5m.has(r.id)) {
          new Notification("Upcoming Call in 5 Minutes!", {
            body: `Reminder for ${r.leadName || "Lead"} at ${callTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
            icon: "/icon.png"
          });
          notified5m.add(r.id);
        }

        if (diffMins === 1 && !notified1m.has(r.id)) {
          new Notification("Call Starting Soon!", {
            body: `Your call with ${r.leadName || "Lead"} is in 1 minute.`,
            icon: "/icon.png"
          });
          notified1m.add(r.id);
        }
      });

      // 2. Power Shot Reminders & Pacing
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Power Shot 1: 11:00 AM
      if (timeStr === "10:55" && !notifiedPowerShots.has("ps1")) {
        new Notification("⚡ Power Shot 1 Approaching!", { body: "Get ready! 11:00 AM - 12:30 PM is for aggressive pipeline building.", icon: "/icon.png" });
        notifiedPowerShots.add("ps1");
      }
      // Power Shot 2: 3:00 PM
      if (timeStr === "14:55" && !notifiedPowerShots.has("ps2")) {
        new Notification("⚡ Power Shot 2 Approaching!", { body: "3:00 PM - 5:00 PM: Extreme volume calling. Let's go!", icon: "/icon.png" });
        notifiedPowerShots.add("ps2");
      }
      // Power Shot 3: 6:00 PM
      if (timeStr === "17:55" && !notifiedPowerShots.has("ps3")) {
        new Notification("⚡ Final Power Shot Approaching!", { body: "6:00 PM - 7:30 PM: Close the day strong!", icon: "/icon.png" });
        notifiedPowerShots.add("ps3");
      }

      // Pacing check (every 30 mins)
      if (now.getTime() - lastPaceCheck > 30 * 60 * 1000) {
        lastPaceCheck = now.getTime();
        
        // Only check pacing during office hours (10:30 to 19:30)
        const currentMins = hours * 60 + minutes;
        const startMins = 10 * 60 + 30; // 10:30
        const endMins = 19 * 60 + 30; // 19:30
        
        if (currentMins >= startMins && currentMins <= endMins) {
          try {
            const user = JSON.parse(localStorage.getItem("bolt_user") || "{}");
            const userId = user.email || user.id;
            if (userId) {
              const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
              const { count } = await supabase
                .from('call_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', startOfDay);

              if (count !== null) {
                const targetCalls = 200;
                const totalWorkingMins = endMins - startMins; // 9 hours = 540 mins
                const elapsedMins = currentMins - startMins;
                const expectedCalls = Math.round((targetCalls / totalWorkingMins) * elapsedMins);
                
                if (count < expectedCalls - 10) {
                  new Notification("⚠️ Pick up the pace!", {
                    body: `You've made ${count} calls. You should be around ${expectedCalls} by now to hit 200 today!`,
                    icon: "/icon.png"
                  });
                }
              }
            }
          } catch (e) {}
        }
      }
    };

    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [reminders]);

  return (
    <header className="h-16 bg-[var(--bolt-bg-depth-2)]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 border-b border-[var(--bolt-border-color)] shadow-sm gap-2 md:gap-4 shrink-0">
      
      {/* Left spacer for perfect centering */}
      <div className="flex-1 hidden md:block"></div>

      {/* Center Search — only on /leads */}
      {isLeadsPage ? (
        <div className="flex-[2] max-w-2xl flex items-center gap-2 px-3 py-1.5 rounded-full surface-3 border border-[var(--bolt-border-color)] focus-within:border-[var(--bolt-accent)] focus-within:ring-2 focus-within:ring-[var(--bolt-accent-glow)] transition-all duration-300">
          <Search size={16} className="text-[var(--bolt-text-secondary)] shrink-0 ml-2" />
          <input 
            type="text" 
            placeholder="Search leads by name, email, or mobile..." 
            className="bg-transparent border-none outline-none text-sm w-full text-[var(--bolt-text-primary)] placeholder:text-[var(--bolt-text-tertiary)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      ) : (
        <div className="flex-[2]" />
      )}

      {/* Right Icons */}
      <div className="flex-1 flex items-center justify-end gap-2">
        <div className="relative" ref={notifRef}>
          <div 
            className="cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--bolt-accent)] rounded-full ring-2 ring-[var(--bolt-bg-depth-2)] shadow-[0_0_8px_var(--bolt-accent-glow)]" />
            )}
          </div>
          
          {showNotifications && (
            <GlassCard depth={2} className="absolute top-full mt-2 right-0 w-80 max-h-[400px] overflow-y-auto z-50 flex flex-col p-0 border border-[var(--bolt-border-color)] shadow-2xl rounded-xl">
              <div className="p-3 border-b border-[var(--bolt-border-color)] font-medium text-[var(--bolt-text-primary)] text-sm">
                Notifications
              </div>
              
              <div className="flex flex-col">
                {jobs.length > 0 && (
                  <div className="flex flex-col">
                    <div className="px-3 py-2 text-xs font-semibold text-[var(--bolt-text-tertiary)] uppercase tracking-wider bg-black/20">
                      Background Jobs
                    </div>
                    {jobs.map(job => (
                      <div key={job.id} className="p-3 border-b border-[var(--bolt-border-color)]/50 hover:bg-white/5 transition-colors group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[var(--bolt-text-primary)] line-clamp-1">{job.title}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {job.status === 'running' ? (
                              <button onClick={() => pauseJob(job.id)} className="p-1 hover:bg-white/10 rounded text-[var(--bolt-text-secondary)] hover:text-white" title="Pause">
                                <Pause size={14} />
                              </button>
                            ) : job.status === 'paused' ? (
                              <button onClick={() => startJob(job.id)} className="p-1 hover:bg-white/10 rounded text-[var(--bolt-text-secondary)] hover:text-white" title="Resume">
                                <Play size={14} />
                              </button>
                            ) : null}
                            <button onClick={() => removeJob(job.id)} className="p-1 hover:bg-white/10 rounded text-[var(--bolt-text-secondary)] hover:text-red-400" title="Dismiss">
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-[var(--bolt-text-secondary)] mb-2">
                          <span className="flex items-center gap-1">
                            {job.status === 'running' && <Loader2 size={12} className="animate-spin text-[var(--bolt-accent)]" />}
                            {job.status === 'completed' && <CheckCircle2 size={12} className="text-green-400" />}
                            {job.status === 'paused' && <Pause size={12} />}
                            {job.status === 'running' ? 'Processing...' : job.status === 'completed' ? 'Done' : job.status === 'failed' ? 'Failed' : 'Paused'}
                          </span>
                          <span>{job.completed} / {job.total}</span>
                        </div>
                        
                        <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${job.status === 'completed' ? 'bg-green-400' : job.status === 'failed' ? 'bg-red-400' : 'bg-[var(--bolt-accent)]'}`}
                            style={{ width: `${(job.completed / job.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {upcomingCount > 0 && (
                  <div className="flex flex-col">
                    <div className="px-3 py-2 text-xs font-semibold text-[var(--bolt-text-tertiary)] uppercase tracking-wider bg-black/20">
                      Upcoming Calls & Reminders
                    </div>
                    <div className="flex flex-col divide-y divide-[var(--bolt-border-color)] max-h-[300px] overflow-y-auto hide-scrollbar">
                      {reminders
                        .filter(r => !r.completed && new Date(r.date) >= new Date())
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map(r => {
                          const rDate = new Date(r.date);
                          const isToday = rDate.toDateString() === new Date().toDateString();
                          return (
                            <div key={r.id} className="p-3 hover:bg-[var(--bolt-bg-depth-3)] transition-colors">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium text-[var(--bolt-text-primary)] truncate">{r.title}</div>
                                  <div className="text-xs text-[var(--bolt-text-secondary)] mt-0.5 truncate">Lead: {r.leadName}</div>
                                </div>
                                <div className={`text-[10px] font-medium whitespace-nowrap px-1.5 py-0.5 rounded-sm ${
                                  isToday ? "bg-[var(--bolt-accent)]/10 text-[var(--bolt-accent)]" : "bg-white/5 text-[var(--bolt-text-tertiary)]"
                                }`}>
                                  {isToday ? "Today" : rDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {rDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          );
                      })}
                    </div>
                  </div>
                )}

                {jobs.length === 0 && upcomingCount === 0 && (
                  <div className="p-6 text-center text-[var(--bolt-text-tertiary)] text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </div>
        <Link 
          href="/settings"
          className="md:hidden w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--bolt-text-secondary)] transition-colors"
          title="Settings"
        >
          <Settings size={16} />
        </Link>
        <Link 
          href="/profile" 
          title="Profile"
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--bolt-accent)] to-[#fde047] shadow-sm ml-2 border border-white/10 flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
        >
          <span className="text-black text-xs font-bold">{userInitials}</span>
        </Link>
      </div>
    </header>
  );
}
