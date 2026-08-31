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
import { toast } from "sonner";

export function TopBar() {
  const { reminders, pruneOldReminders } = useReminderStore();
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
  const [unreadNotifications, setUnreadNotifications] = useState(false);
  const prevNotifCount = useRef(totalNotifications);

  useEffect(() => {
    if (totalNotifications > prevNotifCount.current) {
      setUnreadNotifications(true);
    }
    prevNotifCount.current = totalNotifications;
  }, [totalNotifications]);

  useEffect(() => {
    if (!isLeadsPage) {
      setSearchQuery("");
    }
  }, [isLeadsPage, setSearchQuery]);

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

  // Persistent refs for notification tracking — must survive re-renders
  const notified5m = useRef(new Set<string>());
  const notified1m = useRef(new Set<string>());
  const notifiedPowerShots = useRef(new Set<string>());
  const lastPaceCheck = useRef<number>(0);

  // Prune reminders on mount
  useEffect(() => {
    pruneOldReminders();
  }, [pruneOldReminders]);

  // Check for upcoming calls to fire notifications
  useEffect(() => {

    const checkReminders = async () => {
      const canUseOSNotifs = "Notification" in window && Notification.permission === "granted";

      const now = new Date();
      
      // 1. Regular Call Reminders
      reminders.filter(r => !r.completed).forEach(r => {
        const callTime = new Date(r.date);
        const diffMs = callTime.getTime() - now.getTime();
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins === 5 && !notified5m.current.has(r.id)) {
          const title = "Upcoming Call in 5 Minutes!";
          const body = `Reminder for ${r.leadName || "Lead"} at ${callTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
          toast.info(title, { description: body, duration: 10000 });
          if (canUseOSNotifs) new Notification(title, { body, icon: "/icon.png" });
          
          notified5m.current.add(r.id);
          setUnreadNotifications(true);
        }

        if (diffMins === 1 && !notified1m.current.has(r.id)) {
          const title = "Call Starting Soon!";
          const body = `Your call with ${r.leadName || "Lead"} is in 1 minute.`;
          toast.warning(title, { description: body, duration: 15000 });
          if (canUseOSNotifs) new Notification(title, { body, icon: "/icon.png" });
          
          notified1m.current.add(r.id);
          setUnreadNotifications(true);
        }
      });

      // 2. Power Shot Reminders & Pacing
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      if (timeStr === "10:55" && !notifiedPowerShots.current.has("ps1")) {
        const title = "⚡ Power Shot 1 Approaching!";
        const body = "Get ready! 11:00 AM - 12:30 PM is for aggressive pipeline building.";
        toast.info(title, { description: body, duration: 10000 });
        if (canUseOSNotifs) new Notification(title, { body, icon: "/icon.png" });
        notifiedPowerShots.current.add("ps1");
      }
      if (timeStr === "14:55" && !notifiedPowerShots.current.has("ps2")) {
        const title = "⚡ Power Shot 2 Approaching!";
        const body = "3:00 PM - 5:00 PM: Extreme volume calling. Let's go!";
        toast.info(title, { description: body, duration: 10000 });
        if (canUseOSNotifs) new Notification(title, { body, icon: "/icon.png" });
        notifiedPowerShots.current.add("ps2");
      }
      if (timeStr === "17:55" && !notifiedPowerShots.current.has("ps3")) {
        const title = "⚡ Final Power Shot Approaching!";
        const body = "6:00 PM - 7:30 PM: Close the day strong!";
        toast.info(title, { description: body, duration: 10000 });
        if (canUseOSNotifs) new Notification(title, { body, icon: "/icon.png" });
        notifiedPowerShots.current.add("ps3");
      }

      // Pacing check (only once every 30 minutes, persisted via ref)
      if (now.getTime() - lastPaceCheck.current > 30 * 60 * 1000) {
        lastPaceCheck.current = now.getTime();
        
        const currentMins = hours * 60 + minutes;
        const startMins = 10 * 60 + 30;
        const endMins = 19 * 60 + 30;
        
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
                const totalWorkingMins = endMins - startMins;
                const elapsedMins = currentMins - startMins;
                const expectedCalls = Math.round((targetCalls / totalWorkingMins) * elapsedMins);
                
                if (count < expectedCalls - 10) {
                  const title = "⚠️ Pick up the pace!";
                  const body = `You've made ${count} calls. You should be around ${expectedCalls} by now to hit 200 today!`;
                  toast.warning(title, { description: body, duration: 15000 });
                  if (canUseOSNotifs) new Notification(title, { body, icon: "/icon.png" });
                } else if (count >= expectedCalls) {
                  const title = "🔥 Great pace!";
                  const body = `You're at ${count} calls, tracking ahead of the ${expectedCalls} expectation!`;
                  toast.success(title, { description: body, duration: 8000 });
                  if (canUseOSNotifs) new Notification(title, { body, icon: "/icon.png" });
                }
              }
            }
          } catch (e) {}
        }
      }
    };

    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [reminders, notified5m, notified1m, notifiedPowerShots, lastPaceCheck]);

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
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) setUnreadNotifications(false);
            }}
          >
            <Bell size={18} />
            {unreadNotifications && (
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
                            style={{ width: `${job.total > 0 ? (job.completed / job.total) * 100 : 0}%` }}
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
