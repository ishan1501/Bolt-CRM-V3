"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { Cloud, PhoneCall, TrendingUp, CheckCircle2, Bookmark } from "lucide-react";
import { useSavedLeadsStore } from "@/stores/saved-leads-store";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [userName, setUserName] = useState("");
  
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("bolt_user") || "{}");
      if (u.name) setUserName(u.name.split(" ")[0]);
      else if (u.email) setUserName(u.email.split("@")[0]);
    } catch (e) {}
  }, []);

  const { data: leadsData } = useQuery({
    queryKey: ["allLeads"],
    queryFn: () => crmApi.fetchAllLeads(),
  });

  const savedLeads = useSavedLeadsStore(state => state.savedLeads);

  const [callsDone, setCallsDone] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const user = JSON.parse(localStorage.getItem("bolt_user") || "{}");
      const userId = user.email || user.id;
      if (!userId) return;

      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);
      
      // Get today's calls
      const { count: todayCount } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', todayStart.toISOString());
        
      if (todayCount !== null) setCallsDone(todayCount);

      // Get lifetime calls from users table
      const { data: userData } = await supabase
        .from('users')
        .select('total_calls_made')
        .eq('id', userId)
        .single();
        
      if (userData) setTotalCalls(userData.total_calls_made);
    };
    fetchStats();
  }, []);

  const targetCalls = 20;
  const pct = Math.min(100, Math.round((callsDone / targetCalls) * 100));

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-end gap-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--bolt-text-primary)] tracking-tight mb-1">
              Good {new Date().getHours() < 12 ? "morning" : "afternoon"}{userName ? `, ${userName}` : ""}
            </h1>
            <div className="text-sm text-[var(--bolt-text-tertiary)] font-medium">{todayStr}</div>
          </div>
          {/* Weather Pill */}
          <div className="flex items-center gap-4 bg-[var(--bolt-bg-depth-2)] px-5 py-2.5 rounded-full border border-[var(--bolt-border-color)] shadow-sm self-start">
            <div>
              <div className="text-xs font-bold text-[var(--bolt-text-primary)]">Gurugram</div>
              <div className="text-[10px] text-[var(--bolt-text-tertiary)] font-semibold">AQI 85</div>
            </div>
            <div className="flex items-center gap-2">
              <Cloud size={20} className="text-sky-400" />
              <div className="text-xl font-extrabold text-[var(--bolt-text-primary)] tracking-tight">32°</div>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex bg-[var(--bolt-bg-depth-3)] p-1 rounded-full border border-[var(--bolt-border-color)] self-start sm:self-auto">
          <button className="px-4 py-1.5 text-sm font-medium rounded-full bg-[var(--bolt-accent)] text-black shadow-sm">Today</button>
          <button className="px-4 py-1.5 text-sm font-medium rounded-full text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]">Week</button>
          <button className="px-4 py-1.5 text-sm font-medium rounded-full text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]">Month</button>
        </div>
      </header>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-[var(--bolt-text-primary)]">Call Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Target Progress Card */}
        <GlassCard className="p-6 lg:col-span-8 flex flex-col justify-center border border-[var(--bolt-border-color)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <div className="text-4xl font-extrabold tracking-tight leading-none text-[var(--bolt-text-primary)]">{callsDone}</div>
              <div className="text-xs text-[var(--bolt-text-secondary)] mt-1 font-medium">of {targetCalls} calls today</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold tracking-tight text-[var(--bolt-text-primary)]">{pct}%</div>
              <div className="text-[11px] text-[var(--bolt-text-secondary)] mt-1 font-semibold uppercase tracking-wider">target</div>
            </div>
          </div>
          <div className="h-4 rounded-full bg-[var(--bolt-bg-depth-3)] w-full relative overflow-hidden shadow-inner z-10">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[var(--bolt-accent)] to-[#fde047] transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
          {/* Subtle background glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[var(--bolt-accent)] opacity-5 blur-[100px] pointer-events-none" />
        </GlassCard>

        {/* Saved Leads Metric */}
        <GlassCard className="p-6 lg:col-span-4 flex flex-col justify-center border border-[var(--bolt-border-color)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--bolt-bg-depth-3)] flex items-center justify-center">
              <Bookmark size={20} className="text-[var(--bolt-accent)]" />
            </div>
            <div className="text-sm font-semibold text-[var(--bolt-text-secondary)]">Saved Leads</div>
          </div>
          <div className="text-3xl font-extrabold text-[var(--bolt-text-primary)]">{savedLeads.length}</div>
        </GlassCard>

        {/* Small metric cards */}
        <GlassCard className="p-5 lg:col-span-4">
          <div className="flex items-center gap-2 text-[var(--bolt-text-secondary)] mb-2">
            <PhoneCall size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Calls</span>
          </div>
          <div className="text-2xl font-bold text-[var(--bolt-text-primary)]">{totalCalls}</div>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-4">
          <div className="flex items-center gap-2 text-[var(--bolt-text-secondary)] mb-2">
            <TrendingUp size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Daily Average</span>
          </div>
          <div className="text-2xl font-bold text-[var(--bolt-text-primary)]">{(totalCalls / 7).toFixed(1)}</div>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-4">
          <div className="flex items-center gap-2 text-[var(--bolt-text-secondary)] mb-2">
            <CheckCircle2 size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Calls Done</span>
          </div>
          <div className="text-2xl font-bold text-[var(--bolt-text-primary)]">{callsDone}</div>
        </GlassCard>
      </div>

    </div>
  );
}
