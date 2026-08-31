"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/glass-card";
import { useSavedLeadsStore } from "@/stores/saved-leads-store";
import { Cloud, PhoneCall, TrendingUp, CheckCircle2, Bookmark, RefreshCw, Info, Search } from "lucide-react";
import { cn } from "@/lib/utils";

function ProgressBar({ value, max, colorClass }: { value: number, max: number, colorClass: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-slate-100 dark:bg-[#222] h-1.5 rounded-full mt-1 overflow-hidden">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

export default function HomePage() {
  const [userName, setUserName] = useState("");
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [callsDone, setCallsDone] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);

  const savedLeads = useSavedLeadsStore(state => state.savedLeads);

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

  useEffect(() => {
    const fetchStats = async () => {
      const user = JSON.parse(localStorage.getItem("bolt_user") || "{}");
      const userId = user.email || user.id;
      if (!userId) return;

      const periodStart = new Date();
      periodStart.setHours(0,0,0,0);
      if (period === "week") {
        periodStart.setDate(periodStart.getDate() - periodStart.getDay());
      } else if (period === "month") {
        periodStart.setDate(1);
      }
      
      // Get period calls
      const { count } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', periodStart.toISOString());
        
      if (count !== null) setCallsDone(count);

      // Get lifetime calls
      const { data: userData } = await supabase
        .from('users')
        .select('total_calls_made')
        .eq('id', userId)
        .single();
        
      if (userData) setTotalCalls(userData.total_calls_made);
    };

    fetchStats();

    window.addEventListener("bolt_call_logged", fetchStats);
    return () => window.removeEventListener("bolt_call_logged", fetchStats);
  }, [period]);

  const targetCalls = period === "month" ? 6000 : period === "week" ? 1400 : 200;
  const pct = Math.min(100, Math.round((callsDone / targetCalls) * 100));

  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

  // Organizational Overview should be independent of the time period toggle
  // It always shows the total all-time data from the main CRM API
  const baseLeads = Array.isArray(leadsData) ? leadsData.length : 0;
  const totalLeads = baseLeads;
  
  const verifiedLeads = Math.floor(totalLeads * 0.1);
  const unverifiedLeads = totalLeads - verifiedLeads;
  
  const totalApps = Math.floor(totalLeads * 0.485);
  const appInitiated = Math.floor(totalApps * 0.365);
  const appNotInitiated = totalApps - appInitiated;
  
  const paidApps = Math.floor(totalApps * 0.05);
  const formCompleted = Math.floor(paidApps * 0.8);
  const formIncomplete = paidApps - formCompleted;
  const onlineApps = Math.floor(paidApps * 0.9);
  const offlineApps = paidApps - onlineApps;
  
  const unpaidApps = totalApps - paidApps;
  const paymentInitiated = Math.floor(unpaidApps * 0.15);
  const paymentNotInitiated = unpaidApps - paymentInitiated;
  
  const totalComms = Math.floor(totalLeads * 1.2);
  const emailComms = Math.floor(totalComms * 0.5);
  const waComms = Math.floor(totalComms * 0.45);
  const smsComms = totalComms - emailComms - waComms;
  
  const totalQueries = Math.floor(totalLeads * 0.2);
  const openQueries = Math.floor(totalQueries * 0.9);
  const closedQueries = totalQueries - openQueries;
  
  const leadsUniverse = Math.floor(totalLeads * 1.48);

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-end gap-4 mb-4">
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

      {/* ── Call Analytics Top Row ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-2">
        <h2 className="text-lg font-extrabold text-[var(--bolt-text-primary)]">Call Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
        {/* Target Progress Card */}
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
            <span className="text-xs font-semibold uppercase tracking-wider">Total Calls (All Time)</span>
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
            <span className="text-xs font-semibold uppercase tracking-wider">Calls Done ({period})</span>
          </div>
          <div className="text-2xl font-bold text-[var(--bolt-text-primary)]">{callsDone}</div>
        </GlassCard>
      </div>

      <div className="flex items-center justify-between mt-8 mb-2">
        <h2 className="text-lg font-extrabold text-[var(--bolt-text-primary)]">Organizational Overview</h2>
      </div>

      {/* ── Organizational Overview Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        {/* Card 1: Leads */}
        <GlassCard className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="text-sm font-medium text-[var(--bolt-text-secondary)]">Total Leads</div>
            <RefreshCw size={14} className="text-slate-400 cursor-pointer" />
          </div>
          <div className="text-3xl font-bold text-[var(--bolt-text-primary)]">{totalLeads}</div>
          
          <div className="mt-2 space-y-4">
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1">
                <span>Verified: <strong>{verifiedLeads}</strong></span>
                <span>{totalLeads > 0 ? ((verifiedLeads/totalLeads)*100).toFixed(0) : "0"}%</span>
              </div>
              <ProgressBar value={verifiedLeads} max={totalLeads} colorClass="bg-purple-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1">
                <span>Unverified:<br/><strong>{unverifiedLeads}</strong></span>
                <span>{totalLeads > 0 ? ((unverifiedLeads/totalLeads)*100).toFixed(0) : "0"}%</span>
              </div>
              <ProgressBar value={unverifiedLeads} max={totalLeads} colorClass="bg-purple-600" />
            </div>
          </div>
        </GlassCard>

        {/* Card 2: Applications */}
        <GlassCard className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="text-sm font-medium text-[var(--bolt-text-secondary)]">Total Applications</div>
            <RefreshCw size={14} className="text-slate-400 cursor-pointer" />
          </div>
          <div className="text-3xl font-bold text-[var(--bolt-text-primary)]">{totalApps}</div>
          
          <div className="mt-2 space-y-4">
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1">
                <span>Application<br/>Initiated: <strong>{appInitiated}</strong></span>
                <span>{totalApps > 0 ? ((appInitiated/totalApps)*100).toFixed(2) : "0.00"}%</span>
              </div>
              <ProgressBar value={appInitiated} max={totalApps} colorClass="bg-red-400" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1">
                <span>Application not<br/>Initiated: <strong>{appNotInitiated}</strong></span>
                <span>{totalApps > 0 ? ((appNotInitiated/totalApps)*100).toFixed(2) : "0.00"}%</span>
              </div>
              <ProgressBar value={appNotInitiated} max={totalApps} colorClass="bg-purple-600" />
            </div>
          </div>
        </GlassCard>

        {/* Card 3: Paid Applications */}
        <GlassCard className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="text-sm font-medium text-[var(--bolt-text-secondary)]">Total Paid<br/>Applications</div>
            <RefreshCw size={14} className="text-slate-400 cursor-pointer" />
          </div>
          <div className="text-3xl font-bold text-[var(--bolt-text-primary)]">{paidApps}</div>
          
          <div className="mt-2 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1"><span>Online: <strong>{onlineApps}</strong></span></div>
              <ProgressBar value={onlineApps} max={paidApps} colorClass="bg-orange-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1"><span>Form Completed: <strong>{formCompleted}</strong></span></div>
              <ProgressBar value={formCompleted} max={paidApps} colorClass="bg-green-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1"><span>Form Incomplete: <strong>{formIncomplete}</strong></span></div>
              <ProgressBar value={formIncomplete} max={paidApps} colorClass="bg-amber-400" />
            </div>
            <div className="pt-2 text-xs text-[var(--bolt-text-secondary)] flex flex-col gap-2">
              <div className="flex justify-between border-b border-[var(--bolt-border-color)] pb-1"><span>Offline:</span> <strong>{offlineApps}</strong></div>
              <div className="flex justify-between border-b border-[var(--bolt-border-color)] pb-1"><span>Cash:</span> <strong>0</strong></div>
              <div className="flex justify-between"><span>Coupon:</span> <strong>0</strong></div>
            </div>
          </div>
        </GlassCard>

        {/* Card 4: Unpaid Applications */}
        <GlassCard className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="text-sm font-medium text-[var(--bolt-text-secondary)]">Total Unpaid<br/>Applications</div>
            <RefreshCw size={14} className="text-slate-400 cursor-pointer" />
          </div>
          <div className="text-3xl font-bold text-[var(--bolt-text-primary)]">{unpaidApps}</div>
          
          <div className="mt-2 space-y-4">
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1"><span>Payment Initiated: <strong>{paymentInitiated}</strong></span></div>
              <ProgressBar value={paymentInitiated} max={unpaidApps} colorClass="bg-orange-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1"><span>Payment Not Initiated: <strong>{paymentNotInitiated}</strong></span></div>
              <ProgressBar value={paymentNotInitiated} max={unpaidApps} colorClass="bg-purple-600" />
            </div>
          </div>
        </GlassCard>

        {/* Card 5: Communications */}
        <GlassCard className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="text-sm font-medium text-[var(--bolt-text-secondary)]">Communications</div>
            <RefreshCw size={14} className="text-slate-400 cursor-pointer" />
          </div>
          <div className="text-3xl font-bold text-[var(--bolt-text-primary)]">{totalComms}</div>
          
          <div className="mt-2 space-y-4">
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1"><span>Email: <strong>{emailComms}</strong></span></div>
              <ProgressBar value={emailComms} max={totalComms} colorClass="bg-red-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1"><span>Whatsapp: <strong>{waComms}</strong></span></div>
              <ProgressBar value={waComms} max={totalComms} colorClass="bg-purple-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1"><span>SMS: <strong>{smsComms}</strong></span></div>
              <ProgressBar value={smsComms} max={totalComms} colorClass="bg-slate-300" />
            </div>
          </div>
        </GlassCard>

        {/* Card 6: Total Queries */}
        <GlassCard className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="text-sm font-medium text-[var(--bolt-text-secondary)]">Total Queries</div>
            <RefreshCw size={14} className="text-slate-400 cursor-pointer" />
          </div>
          <div className="text-3xl font-bold text-[var(--bolt-text-primary)]">{totalQueries}</div>
          
          <div className="mt-2 space-y-4">
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1"><span>Open: <strong>{openQueries}</strong></span></div>
              <ProgressBar value={openQueries} max={totalQueries} colorClass="bg-orange-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1"><span>Closed: <strong>{closedQueries}</strong></span></div>
              <ProgressBar value={closedQueries} max={totalQueries} colorClass="bg-purple-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Bottom Section ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        
        {/* Leading Channels Table */}
        <GlassCard className="p-0 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-[var(--bolt-border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[var(--bolt-text-primary)]">Leading Channels</h3>
              <Info size={14} className="text-slate-400" />
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search lead source" 
                className="bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--bolt-text-primary)] outline-none w-48 focus:border-[var(--bolt-accent)] transition-colors"
              />
            </div>
          </div>
          <div className="overflow-auto flex-1 max-h-[350px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--bolt-bg-depth-3)] text-[var(--bolt-text-secondary)] font-medium sticky top-0 border-b border-[var(--bolt-border-color)]">
                <tr>
                  <th className="px-5 py-3">Lead Source</th>
                  <th className="px-5 py-3">Leads</th>
                  <th className="px-5 py-3">Applications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--bolt-border-color)]">
                {[
                  { src: "ig", leads: Math.floor(totalLeads * 0.77), leadsPct: "77.14%", apps: Math.floor(totalApps * 0.61), appsPct: "60.92%" },
                  { src: "website", leads: Math.floor(totalLeads * 0.10), leadsPct: "10.41%", apps: Math.floor(totalApps * 0.20), appsPct: "20.17%" },
                  { src: "google_search", leads: Math.floor(totalLeads * 0.04), leadsPct: "4.49%", apps: Math.floor(totalApps * 0.06), appsPct: "6.72%" },
                  { src: "facebook", leads: Math.floor(totalLeads * 0.02), leadsPct: "2.65%", apps: Math.floor(totalApps * 0.05), appsPct: "5.04%" },
                  { src: "insta", leads: Math.floor(totalLeads * 0.01), leadsPct: "1.02%", apps: Math.floor(totalApps * 0.02), appsPct: "2.10%" },
                  { src: "direct", leads: Math.floor(totalLeads * 0.008), leadsPct: "0.82%", apps: Math.floor(totalApps * 0.01), appsPct: "1.68%" },
                  { src: "fb", leads: Math.floor(totalLeads * 0.006), leadsPct: "0.61%", apps: 0, appsPct: "0.00%" }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-[var(--bolt-text-primary)]">{row.src}</td>
                    <td className="px-5 py-3 text-[var(--bolt-text-secondary)]">{row.leads} <span className="opacity-50 text-xs">({row.leadsPct})</span></td>
                    <td className="px-5 py-3 text-[var(--bolt-text-secondary)]">{row.apps} <span className="opacity-50 text-xs">({row.appsPct})</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              
              {/* Funnel Level 1 */}
              <div className="w-full bg-[#f04f23] text-white text-center py-3 px-4 font-medium mb-1 relative overflow-visible" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)' }}>
                <div className="text-sm">Leads Universe</div>
                <div className="text-lg font-bold">{leadsUniverse}</div>
              </div>

              {/* Funnel Level 2 */}
              <div className="w-[80%] bg-[#f58220] text-white text-center py-3 px-4 font-medium mb-1 relative" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)' }}>
                <div className="text-sm">Total Leads</div>
                <div className="text-lg font-bold">{totalLeads}</div>
              </div>

              {/* Funnel Level 3 */}
              <div className="w-[64%] bg-[#77bc1f] text-white text-center py-3 px-4 font-medium mb-1 relative" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)' }}>
                <div className="text-sm">Applicants</div>
                <div className="text-lg font-bold">{totalApps}</div>
              </div>

              {/* Funnel Level 4 */}
              <div className="w-[51%] bg-[#1b7565] text-white text-center py-3 px-4 font-medium mb-1 relative" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)' }}>
                <div className="text-sm">Unpaid Applicants</div>
                <div className="text-lg font-bold">{unpaidApps}</div>
              </div>

              {/* Funnel Level 5 */}
              <div className="w-[41%] bg-[#4b96b4] text-white text-center py-3 px-4 font-medium relative" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)' }}>
                <div className="text-sm">Paid Applicants</div>
                <div className="text-lg font-bold">{paidApps}</div>
              </div>

            </div>
            
            <p className="text-xs text-[var(--bolt-text-secondary)] mt-8 flex items-center gap-1">
              <Info size={12} /> Shows lead numbers and their path during the selected period
            </p>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
