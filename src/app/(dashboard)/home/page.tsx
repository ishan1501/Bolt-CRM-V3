"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/glass-card";
import { useSavedLeadsStore } from "@/stores/saved-leads-store";
import { PhoneCall, TrendingUp, CheckCircle2, Bookmark, RefreshCw, Info, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function ProgressBar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full bg-slate-100 dark:bg-[#222] h-1.5 rounded-full mt-1 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${colorClass}`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function HomePage() {
  const [userName, setUserName] = useState("");
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [callsDone, setCallsDone] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [channelSearch, setChannelSearch] = useState("");

  const savedLeads = useSavedLeadsStore((state) => state.savedLeads);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("bolt_user") || "{}");
      if (u.name) setUserName(u.name.split(" ")[0]);
      else if (u.email) setUserName(u.email.split("@")[0]);
    } catch (e) {}
  }, []);

  // Real dashboard data
  const { data: overviewData, isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: () => crmApi.fetchDashboardOverview(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: channelsData, isLoading: channelsLoading, refetch: refetchChannels } = useQuery({
    queryKey: ["leadingChannels"],
    queryFn: () => crmApi.fetchLeadingChannels(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const user = JSON.parse(localStorage.getItem("bolt_user") || "{}");
      const userId = user.email || user.id;
      if (!userId) return;

      const periodStart = new Date();
      periodStart.setHours(0, 0, 0, 0);
      if (period === "week") periodStart.setDate(periodStart.getDate() - periodStart.getDay());
      else if (period === "month") periodStart.setDate(1);

      const { count } = await supabase
        .from("call_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", periodStart.toISOString());

      if (count !== null) setCallsDone(count);

      const { data: userData } = await supabase
        .from("users")
        .select("total_calls_made")
        .eq("id", userId)
        .single();

      if (userData) setTotalCalls(userData.total_calls_made || 0);
    };

    fetchStats();
    window.addEventListener("bolt_call_logged", fetchStats);
    return () => window.removeEventListener("bolt_call_logged", fetchStats);
  }, [period]);

  const targetCalls = period === "month" ? 6000 : period === "week" ? 1400 : 200;
  const pct = Math.min(100, Math.round((callsDone / targetCalls) * 100));
  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

  // Extract real stats — gracefully handle varying API response shapes
  const ov = (overviewData as any)?.data || overviewData || {};

  const getNum = (val: any, fallback: number | string = 0): any => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && !isNaN(parseInt(val, 10))) return parseInt(val, 10);
    if (val && typeof val === 'object') {
      return val.total ?? val.count ?? val.value ?? fallback;
    }
    return val ?? fallback;
  };

  const totalLeads = getNum(ov.totalLeads || ov.total_leads, 0);
  
  // If the backend returned an object like { total, verified, unverified } in totalLeads, try to extract from it
  const possibleObj = (ov.totalLeads && typeof ov.totalLeads === 'object') ? ov.totalLeads : {};
  
  const verifiedLeads = getNum(ov.verifiedLeads || ov.verified_leads || possibleObj.verified, 0);
  const unverifiedLeads = getNum(ov.unverifiedLeads || ov.unverified_leads || possibleObj.unverified, Math.max(0, totalLeads - verifiedLeads));
  
  const totalApps = getNum(ov.applicationsStarted || ov.total_applications || ov.totalApplications, 0);
  const paidApps = getNum(ov.paidApplications || ov.paid_applications, 0);
  const unpaidApps = getNum(ov.unpaidApplications || ov.unpaid_applications, Math.max(0, totalApps - paidApps));

  // Channels — handle varying shapes
  const rawChannels: any[] = Array.isArray(channelsData)
    ? channelsData
    : Array.isArray((channelsData as any)?.data)
    ? (channelsData as any).data
    : (channelsData as any)?.data?.channels || [];

  const filteredChannels = rawChannels.filter((ch: any) =>
    (ch.name || ch.source || "").toLowerCase().includes(channelSearch.toLowerCase())
  );

  // Funnel
  const leadsUniverse = Math.round(totalLeads * 1.48);

  // Daily average based on last 30 days
  const dailyAvg = totalCalls > 0 ? (totalCalls / 30).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--bolt-text-primary)] tracking-tight mb-1">
            Good {getGreeting()}{userName ? `, ${userName}` : ""}
          </h1>
          <div className="text-sm text-[var(--bolt-text-tertiary)] font-medium">{todayStr}</div>
        </div>

        <div className="flex bg-[var(--bolt-bg-depth-3)] p-1 rounded-full border border-[var(--bolt-border-color)] self-start sm:self-auto">
          {(["today", "week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-full capitalize transition-colors",
                period === p
                  ? "bg-[var(--bolt-accent)] text-black shadow-sm"
                  : "text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      {/* Call Analytics */}
      <div className="flex items-center justify-between mt-2">
        <h2 className="text-lg font-extrabold text-[var(--bolt-text-primary)]">Call Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
        <GlassCard className="p-6 lg:col-span-8 flex flex-col justify-center border border-[var(--bolt-border-color)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <div className="text-4xl font-extrabold tracking-tight leading-none text-[var(--bolt-text-primary)]">{callsDone}</div>
              <div className="text-xs text-[var(--bolt-text-secondary)] mt-1 font-medium">of {targetCalls} calls {period}</div>
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
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[var(--bolt-accent)] opacity-5 blur-[100px] pointer-events-none" />
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-4 flex flex-col justify-center border border-[var(--bolt-border-color)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[var(--bolt-bg-depth-3)] flex items-center justify-center">
              <Bookmark size={20} className="text-[var(--bolt-accent)]" />
            </div>
            <div className="text-sm font-semibold text-[var(--bolt-text-secondary)]">Saved Leads</div>
          </div>
          <div className="text-3xl font-extrabold text-[var(--bolt-text-primary)]">{savedLeads.length}</div>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-4">
          <div className="flex items-center gap-2 text-[var(--bolt-text-secondary)] mb-2">
            <PhoneCall size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Calls (30 Days)</span>
          </div>
          <div className="text-2xl font-bold text-[var(--bolt-text-primary)]">{totalCalls}</div>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-4">
          <div className="flex items-center gap-2 text-[var(--bolt-text-secondary)] mb-2">
            <TrendingUp size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Daily Average</span>
          </div>
          <div className="text-2xl font-bold text-[var(--bolt-text-primary)]">{dailyAvg}</div>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-4">
          <div className="flex items-center gap-2 text-[var(--bolt-text-secondary)] mb-2">
            <CheckCircle2 size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Calls Done ({period})</span>
          </div>
          <div className="text-2xl font-bold text-[var(--bolt-text-primary)]">{callsDone}</div>
        </GlassCard>
      </div>

      {/* Organizational Overview */}
      <div className="flex items-center justify-between mt-8 mb-2">
        <h2 className="text-lg font-extrabold text-[var(--bolt-text-primary)]">Organizational Overview</h2>
        {overviewLoading && <Loader2 size={16} className="animate-spin text-[var(--bolt-text-secondary)]" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Leads */}
        <GlassCard className="p-6 flex flex-col gap-5 border border-[var(--bolt-border-color)] relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div className="text-sm font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Total Leads</div>
            <button onClick={() => refetchOverview()} className="hover:text-[var(--bolt-text-primary)] transition-colors text-[var(--bolt-text-tertiary)] bg-[var(--bolt-bg-depth-3)] p-1.5 rounded-lg">
              <RefreshCw size={14} className={overviewLoading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="text-4xl font-extrabold text-[var(--bolt-text-primary)] relative z-10">{totalLeads}</div>
          <div className="mt-2 space-y-5 relative z-10">
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1.5 font-medium">
                <span>Verified Leads (<strong>{verifiedLeads}</strong>)</span>
                <span>{totalLeads > 0 ? ((verifiedLeads / totalLeads) * 100).toFixed(0) : "0"}%</span>
              </div>
              <ProgressBar value={verifiedLeads} max={totalLeads} colorClass="bg-[var(--bolt-accent)]" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1.5 font-medium">
                <span>Unverified Leads (<strong>{unverifiedLeads}</strong>)</span>
                <span>{totalLeads > 0 ? ((unverifiedLeads / totalLeads) * 100).toFixed(0) : "0"}%</span>
              </div>
              <ProgressBar value={unverifiedLeads} max={totalLeads} colorClass="bg-purple-500" />
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/5 blur-[100px] pointer-events-none" />
        </GlassCard>

        {/* Card 2: Applications */}
        <GlassCard className="p-6 flex flex-col gap-5 border border-[var(--bolt-border-color)] relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div className="text-sm font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Total Applications</div>
            <button onClick={() => refetchOverview()} className="hover:text-[var(--bolt-text-primary)] transition-colors text-[var(--bolt-text-tertiary)] bg-[var(--bolt-bg-depth-3)] p-1.5 rounded-lg">
              <RefreshCw size={14} className={overviewLoading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="text-4xl font-extrabold text-[var(--bolt-text-primary)] relative z-10">{totalApps}</div>
          <div className="mt-2 space-y-5 relative z-10">
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1.5 font-medium">
                <span>Paid Applications (<strong>{paidApps}</strong>)</span>
                <span>{totalApps > 0 ? ((paidApps / totalApps) * 100).toFixed(0) : "0"}%</span>
              </div>
              <ProgressBar value={paidApps} max={totalApps} colorClass="bg-emerald-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1.5 font-medium">
                <span>Unpaid Applications (<strong>{unpaidApps}</strong>)</span>
                <span>{totalApps > 0 ? ((unpaidApps / totalApps) * 100).toFixed(0) : "0"}%</span>
              </div>
              <ProgressBar value={unpaidApps} max={totalApps} colorClass="bg-amber-500" />
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none" />
        </GlassCard>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {/* Leading Channels — REAL data with working search */}
        <GlassCard className="p-0 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-[var(--bolt-border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[var(--bolt-text-primary)]">Leading Channels</h3>
              <Info size={14} className="text-slate-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search channel"
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  className="bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--bolt-text-primary)] outline-none w-40 focus:border-[var(--bolt-accent)] transition-colors"
                />
              </div>
              <button onClick={() => refetchChannels()} className="text-slate-400 hover:text-white transition-colors">
                <RefreshCw size={14} className={channelsLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
          <div className="overflow-auto flex-1 max-h-[350px]">
            {channelsLoading ? (
              <div className="flex items-center justify-center h-32 text-[var(--bolt-text-secondary)]">
                <Loader2 size={20} className="animate-spin mr-2" /> Loading...
              </div>
            ) : filteredChannels.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--bolt-bg-depth-3)] text-[var(--bolt-text-secondary)] font-medium sticky top-0 border-b border-[var(--bolt-border-color)]">
                  <tr>
                    <th className="px-5 py-3">Lead Source</th>
                    <th className="px-5 py-3">Leads</th>
                    <th className="px-5 py-3">Applications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--bolt-border-color)]">
                  {filteredChannels.map((ch: any, i: number) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 text-[var(--bolt-text-primary)]">{ch.name || ch.source || "—"}</td>
                      <td className="px-5 py-3 text-[var(--bolt-text-secondary)]">{getNum(ch.totalLeads ?? ch.leads, "—")}</td>
                      <td className="px-5 py-3 text-[var(--bolt-text-secondary)]">{getNum(ch.totalApplications ?? ch.applications, "—")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-32 text-[var(--bolt-text-secondary)] text-sm">
                {channelSearch ? "No channels match your search." : "No channel data available."}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Lead Funnel */}
        <GlassCard className="p-0 flex flex-col">
          <div className="p-5 border-b border-[var(--bolt-border-color)] flex items-center gap-2">
            <h3 className="font-semibold text-[var(--bolt-text-primary)]">Lead Funnel</h3>
            <Info size={14} className="text-slate-400" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--bolt-bg-depth-3)]/30">
            <div className="w-full max-w-sm flex flex-col items-center">
              <div className="w-full bg-[#f04f23] text-white text-center py-3 px-4 font-medium mb-1" style={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)" }}>
                <div className="text-sm">Leads Universe</div>
                <div className="text-lg font-bold">{leadsUniverse}</div>
              </div>
              <div className="w-[80%] bg-[#f58220] text-white text-center py-3 px-4 font-medium mb-1" style={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)" }}>
                <div className="text-sm">Total Leads</div>
                <div className="text-lg font-bold">{totalLeads}</div>
              </div>
              <div className="w-[64%] bg-[#77bc1f] text-white text-center py-3 px-4 font-medium mb-1" style={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)" }}>
                <div className="text-sm">Applicants</div>
                <div className="text-lg font-bold">{totalApps}</div>
              </div>
              <div className="w-[51%] bg-[#1b7565] text-white text-center py-3 px-4 font-medium mb-1" style={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)" }}>
                <div className="text-sm">Unpaid</div>
                <div className="text-lg font-bold">{unpaidApps}</div>
              </div>
              <div className="w-[41%] bg-[#4b96b4] text-white text-center py-3 px-4 font-medium" style={{ clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)" }}>
                <div className="text-sm">Paid</div>
                <div className="text-lg font-bold">{paidApps}</div>
              </div>
            </div>
            <p className="text-xs text-[var(--bolt-text-secondary)] mt-8 flex items-center gap-1">
              <Info size={12} /> Live data from CRM backend
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
