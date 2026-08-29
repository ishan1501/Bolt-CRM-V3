"use client";

import { useReminderStore } from "@/stores/reminder-store";
import { GlassCard } from "@/components/ui/glass-card";
import { PhoneCall, Calendar, CheckCircle2, Clock, PhoneOutgoing, Activity } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, isPast, isToday, format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useUIStore } from "@/stores/ui-store";

export default function CallsPage() {
  const { reminders, markCompleted, removeReminder } = useReminderStore();
  const { openDrawer } = useUIStore();

  // Fetch real call logs from Supabase
  const { data: callLogs, isLoading } = useQuery({
    queryKey: ['callLogs'],
    queryFn: async () => {
      const user = JSON.parse(localStorage.getItem("bolt_user") || "{}");
      const userId = user.email || user.id;
      if (!userId) return [];

      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Failed to fetch call logs", error);
        return [];
      }
      return data;
    },
    refetchInterval: 1000 * 30 // Refresh every 30 seconds
  });

  const activeReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  // Group active reminders
  const overdue = activeReminders.filter(r => isPast(new Date(r.date)) && !isToday(new Date(r.date)));
  const today = activeReminders.filter(r => isToday(new Date(r.date)));
  const upcoming = activeReminders.filter(r => !isPast(new Date(r.date)) && !isToday(new Date(r.date)));

  // Group call logs
  const logsToday = (callLogs || []).filter(log => isToday(new Date(log.created_at)));
  
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const logsThisWeek = (callLogs || []).filter(log => new Date(log.created_at).getTime() >= startOfWeek.getTime());

  const renderReminderList = (list: typeof reminders, title: string, color: "red" | "yellow" | "blue" | "green") => {
    if (list.length === 0) return null;

    const colors = {
      red: "text-rose-400 bg-rose-400/10 border-rose-400/20",
      yellow: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      blue: "text-sky-400 bg-sky-400/10 border-sky-400/20",
      green: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    };

    return (
      <div className="mb-6 last:mb-0">
        <h3 className="text-xs font-bold text-[var(--bolt-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
          {title} <span className={cn("px-2 py-0.5 rounded-full text-[10px] border", colors[color])}>{list.length}</span>
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {list.map(r => (
            <GlassCard key={r.id} className="p-4 flex flex-col gap-3 group border border-[var(--bolt-border-color)] hover:border-[var(--bolt-accent)]/30 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-[var(--bolt-text-primary)]">{r.title}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--bolt-text-tertiary)] mt-1">
                    <Clock size={12} />
                    {format(new Date(r.date), "MMM d, h:mm a")}
                    <span className="opacity-50">·</span>
                    <span className={isPast(new Date(r.date)) && !r.completed ? "text-rose-400 font-medium" : ""}>
                      {formatDistanceToNow(new Date(r.date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                {r.leadUuid && (
                  <Link href={`/leads?uuid=${r.leadUuid}`} className="w-8 h-8 rounded-full bg-[var(--bolt-bg-depth-3)] flex items-center justify-center text-[var(--bolt-text-secondary)] hover:text-white hover:bg-[var(--bolt-accent)] transition-all">
                    <PhoneCall size={14} />
                  </Link>
                )}
              </div>
              
              {!r.completed && (
                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[var(--bolt-border-color)]">
                  <button 
                    onClick={() => markCompleted(r.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors"
                  >
                    <CheckCircle2 size={14} />
                    Done
                  </button>
                  <button 
                    onClick={() => removeReminder(r.id)}
                    className="px-3 py-1.5 rounded-lg text-[var(--bolt-text-tertiary)] hover:text-rose-400 hover:bg-rose-400/10 text-xs font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bolt-bg-depth-2)] flex items-center justify-center shadow-sm border border-[var(--bolt-border-color)]">
            <PhoneCall size={24} className="text-[var(--bolt-accent)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--bolt-text-primary)]">Calls Central</h1>
            <p className="text-sm text-[var(--bolt-text-secondary)]">Manage your scheduled calls and view your call history.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Call Logs */}
        <div className="space-y-4">
          
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--bolt-text-primary)] uppercase tracking-wider mb-2">
            <Activity size={16} className="text-[var(--bolt-accent)]" />
            Your Call History
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <GlassCard className="p-4 flex flex-col justify-center">
              <div className="text-xs font-medium text-[var(--bolt-text-secondary)] mb-1">Calls Today</div>
              <div className="text-3xl font-extrabold text-[var(--bolt-text-primary)]">{logsToday.length}</div>
            </GlassCard>
            <GlassCard className="p-4 flex flex-col justify-center">
              <div className="text-xs font-medium text-[var(--bolt-text-secondary)] mb-1">Calls This Week</div>
              <div className="text-3xl font-extrabold text-[var(--bolt-text-primary)]">{logsThisWeek.length}</div>
            </GlassCard>
          </div>

          <GlassCard className="p-0 overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center text-[var(--bolt-text-secondary)]">
                <Activity size={32} className="mb-3 animate-pulse opacity-50" />
                <p className="text-sm">Loading call logs...</p>
              </div>
            ) : (!callLogs || callLogs.length === 0) ? (
              <div className="p-12 text-center flex flex-col items-center justify-center text-[var(--bolt-text-secondary)]">
                <PhoneOutgoing size={32} className="mb-3 opacity-50" />
                <p className="font-medium text-[var(--bolt-text-primary)]">No calls logged yet</p>
                <p className="text-xs mt-1">Dial a lead to track your first call!</p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto divide-y divide-[var(--bolt-border-color)]">
                {callLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-[var(--bolt-bg-depth-3)] transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--bolt-accent)]/10 text-[var(--bolt-accent)] flex items-center justify-center">
                        <PhoneOutgoing size={14} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--bolt-text-primary)]">
                          {log.lead_name && log.lead_name !== "Unknown Lead" ? log.lead_name : "Outbound Call"}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {log.lead_phone && log.lead_phone !== "Unknown Phone" && (
                            <span className="text-xs font-medium text-[var(--bolt-text-secondary)]">
                              {log.lead_phone.startsWith('+') ? log.lead_phone : `+91 ${log.lead_phone}`}
                            </span>
                          )}
                          {log.lead_phone && log.lead_phone !== "Unknown Phone" && (
                            <span className="text-[var(--bolt-text-tertiary)]">•</span>
                          )}
                          <span className="text-xs text-[var(--bolt-text-tertiary)]">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {log.lead_uuid && (
                      <button 
                        onClick={() => openDrawer(log.lead_uuid!)}
                        className="text-xs font-semibold text-[var(--bolt-accent)] hover:text-white px-3 py-1.5 rounded-lg bg-[var(--bolt-bg-depth-3)] hover:bg-[var(--bolt-accent)] transition-colors"
                      >
                        View Profile
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

        </div>

        {/* RIGHT COLUMN: Scheduled Reminders */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--bolt-text-primary)] uppercase tracking-wider mb-2">
            <Calendar size={16} className="text-emerald-400" />
            Scheduled Calls
          </div>

          {reminders.length === 0 ? (
            <GlassCard className="flex flex-col items-center justify-center p-12 text-center border-dashed">
              <Calendar size={48} className="text-[var(--bolt-text-tertiary)] mb-4" />
              <h3 className="text-base font-semibold text-[var(--bolt-text-primary)]">No scheduled calls</h3>
              <p className="text-[var(--bolt-text-secondary)] mt-2 text-sm">
                When you set a reminder on a lead's profile, it will appear here.
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-6">
              {renderReminderList(overdue, "Overdue", "red")}
              {renderReminderList(today, "Today", "yellow")}
              {renderReminderList(upcoming, "Upcoming", "blue")}
              {renderReminderList(completedReminders, "Completed", "green")}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
