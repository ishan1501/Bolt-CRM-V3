"use client";

import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { RefreshCw, Info, Search } from "lucide-react";
import { useState, useEffect } from "react";

function ProgressBar({ value, max, colorClass }: { value: number, max: number, colorClass: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-slate-100 dark:bg-[#222] h-1.5 rounded-full mt-1 overflow-hidden">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

export default function DashboardPage() {
  const { data: leadsData } = useQuery({
    queryKey: ["allLeads"],
    queryFn: () => crmApi.fetchAllLeads(),
  });

  const totalLeads = Array.isArray(leadsData) ? leadsData.length : 490;
  
  // Computed dummy stats based on totalLeads to match screenshot scale
  const verifiedLeads = 0;
  const unverifiedLeads = totalLeads;
  
  const totalApps = Math.floor(totalLeads * 0.485);
  const appInitiated = Math.floor(totalApps * 0.365);
  const appNotInitiated = totalApps - appInitiated;
  
  const paidApps = 8;
  const formCompleted = 7;
  const formIncomplete = 1;
  const onlineApps = 0;
  const offlineApps = 0;
  
  const unpaidApps = totalApps - paidApps;
  const paymentInitiated = 15;
  const paymentNotInitiated = unpaidApps - paymentInitiated;
  
  const totalComms = 17;
  const emailComms = 9;
  const waComms = 8;
  const smsComms = 0;
  
  const totalQueries = 103;
  const openQueries = 95;
  const closedQueries = 8;
  
  const leadsUniverse = Math.floor(totalLeads * 1.48);

  const [userName, setUserName] = useState("");
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("bolt_user") || "{}");
      if (u.name) setUserName(u.name);
      else if (u.email) setUserName(u.email.split("@")[0]);
    } catch (e) {}
  }, []);

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--bolt-text-primary)]">
            Organizational Overview for Executive Education
          </h1>
          <p className="text-sm text-[var(--bolt-text-secondary)] mt-1">
            {userName ? <>👋 Welcome back, <span className="font-medium text-[var(--bolt-text-primary)]">{userName}</span> · </> : null}Joined Jul 9, 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="surface-2 border border-[var(--bolt-border-color)] rounded-lg px-4 py-2 text-sm text-[var(--bolt-text-primary)] outline-none">
            <option>All Forms</option>
          </select>
          <input 
            type="text" 
            placeholder="Date Range" 
            className="surface-2 border border-[var(--bolt-border-color)] rounded-lg px-4 py-2 text-sm text-[var(--bolt-text-primary)] outline-none w-32"
          />
        </div>
      </div>

      {/* ── Top Row 6 Cards ─────────────────────────────────────────────────── */}
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
                <span>0%</span>
              </div>
              <ProgressBar value={verifiedLeads} max={totalLeads} colorClass="bg-purple-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-[var(--bolt-text-secondary)] mb-1">
                <span>Unverified:<br/><strong>{unverifiedLeads}</strong></span>
                <span>100%</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
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
                className="surface-2 border border-[var(--bolt-border-color)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--bolt-text-primary)] outline-none w-48"
              />
            </div>
          </div>
          <div className="overflow-auto flex-1 max-h-[350px]">
            <table className="w-full text-sm text-left">
              <thead className="surface-2 text-[var(--bolt-text-secondary)] font-medium sticky top-0 border-b border-[var(--bolt-border-color)]">
                <tr>
                  <th className="px-5 py-3">Lead Source</th>
                  <th className="px-5 py-3">Leads</th>
                  <th className="px-5 py-3">Applications</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--bolt-border-color)]">
                {[
                  { src: "ig", leads: 378, leadsPct: "77.14%", apps: 145, appsPct: "60.92%" },
                  { src: "website", leads: 51, leadsPct: "10.41%", apps: 48, appsPct: "20.17%" },
                  { src: "google_search", leads: 22, leadsPct: "4.49%", apps: 16, appsPct: "6.72%" },
                  { src: "facebook", leads: 13, leadsPct: "2.65%", apps: 12, appsPct: "5.04%" },
                  { src: "insta", leads: 5, leadsPct: "1.02%", apps: 5, appsPct: "2.10%" },
                  { src: "direct", leads: 4, leadsPct: "0.82%", apps: 4, appsPct: "1.68%" },
                  { src: "fb", leads: 3, leadsPct: "0.61%", apps: 0, appsPct: "0.00%" }
                ].map((row, i) => (
                  <tr key={i} className="hover:surface-2">
                    <td className="px-5 py-3 text-[var(--bolt-text-primary)]">{row.src}</td>
                    <td className="px-5 py-3 text-[var(--bolt-text-secondary)]">{row.leads} <span className="text-slate-400 dark:text-[var(--bolt-text-secondary)] text-xs">({row.leadsPct})</span></td>
                    <td className="px-5 py-3 text-[var(--bolt-text-secondary)]">{row.apps} <span className="text-slate-400 dark:text-[var(--bolt-text-secondary)] text-xs">({row.appsPct})</span></td>
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
          <div className="flex-1 flex flex-col items-center justify-center p-8 surface-1">
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
              <Info size={12} /> Shows lead numbers and their path during the selected dates
            </p>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
