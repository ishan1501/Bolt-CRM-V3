"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { CheckCircle, XCircle, Users, PhoneCall, TrendingUp, BarChart2, Calendar, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"approvals" | "analytics" | "users">("approvals");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  // Fetch pending approvals
  const { data: approvalsData, isLoading: isLoadingApprovals } = useQuery({
    queryKey: ["admin-pending-approvals"],
    queryFn: async () => {
      const res = await fetch("/api/admin/pending-approvals");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 10000,
  });

  // Fetch analytics
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["admin-call-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/call-analytics");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Fetch all users
  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ email, action }: { email: string; action: "approve" | "reject" }) => {
      const res = await fetch("/api/admin/approve-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action }),
      });
      if (!res.ok) throw new Error("Action failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-call-analytics"] });
    },
  });

  const approvals = approvalsData?.approvals || [];
  const pendingApprovals = approvals.filter((a: any) => a.status === "pending");
  const approvedPayments = approvals.filter((a: any) => a.status === "active" || a.status === "paused");
  
  const logs = analyticsData?.logs || [];
  const users = analyticsData?.users || {};
  const allUsers = usersResponse?.users || [];

  // Filter logs based on period
  const now = new Date();
  let periodStart = now;
  let periodEnd = now;

  if (period === "daily") {
    periodStart = startOfDay(now);
    periodEnd = endOfDay(now);
  } else if (period === "weekly") {
    periodStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    periodEnd = endOfWeek(now, { weekStartsOn: 1 });
  } else {
    periodStart = startOfMonth(now);
    periodEnd = endOfMonth(now);
  }

  const filteredLogs = logs.filter((log: any) => {
    const logDate = parseISO(log.created_at);
    return isWithinInterval(logDate, { start: periodStart, end: periodEnd });
  });

  const stats = analyticsData?.stats || [];
  const filteredStats = stats.filter((stat: any) => {
    const statDate = parseISO(stat.date);
    return isWithinInterval(statDate, { start: periodStart, end: periodEnd });
  });

  // Analytics computation
  // For daily, use precise logs. For weekly/monthly, use aggregated stats.
  const isDaily = period === "daily";
  
  const periodTotalCalls = isDaily 
    ? filteredLogs.length 
    : filteredStats.reduce((sum: number, stat: any) => sum + (stat.calls_count || 0), 0);
  
  // Aggregate calls per user
  const callerStats = (isDaily ? filteredLogs : filteredStats).reduce((acc: any, item: any) => {
    const user = users[item.user_id] || item.user_id;
    acc[user] = (acc[user] || 0) + (isDaily ? 1 : (item.calls_count || 0));
    return acc;
  }, {});

  const topCallers = Object.entries(callerStats)
    .map(([name, calls]) => ({ name, calls: calls as number }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 10);

  let trendDays: { name: string; calls: number }[] = [];
  
  // Calls by day for weekly/monthly
  const callsByDay = (isDaily ? logs : stats).reduce((acc: any, item: any) => {
    try {
      const day = format(parseISO(isDaily ? item.created_at : item.date), "MMM dd");
      acc[day] = (acc[day] || 0) + (isDaily ? 1 : (item.calls_count || 0));
    } catch(e) {}
    return acc;
  }, {});

  if (period === "daily") {
    trendDays = Array.from({ length: 24 }).map((_, i) => {
      const label = i === 0 ? "12AM" : i < 12 ? `${i}AM` : i === 12 ? "12PM" : `${i - 12}PM`;
      const hourCalls = filteredLogs.reduce((acc: any, log: any) => {
        const h = new Date(log.created_at).getHours();
        acc[h] = (acc[h] || 0) + 1;
        return acc;
      }, {})[i] || 0;
      return { name: label, calls: hourCalls };
    });
  } else if (period === "weekly") {
    trendDays = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(periodStart);
      d.setDate(d.getDate() + i);
      const day = format(d, "MMM dd");
      return { name: day, calls: callsByDay[day] || 0 };
    });
  } else if (period === "monthly") {
    const daysInMonth = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0).getDate();
    trendDays = Array.from({ length: daysInMonth }).map((_, i) => {
      const d = new Date(periodStart);
      d.setDate(d.getDate() + i);
      const day = format(d, "MMM dd");
      return { name: day, calls: callsByDay[day] || 0 };
    });
  }

  const maxCallsDay = Math.max(...trendDays.map((d) => d.calls), 10);

  // Heatmap: Group calls by hour of the day (based on filtered logs)
  const callsByHour = filteredLogs.reduce((acc: any, log: any) => {
    const hour = new Date(log.created_at).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  // Create 24 hour array
  const hourlyData = Array.from({ length: 24 }).map((_, i) => ({
    hour: i,
    label: i === 0 ? "12AM" : i < 12 ? `${i}AM` : i === 12 ? "12PM" : `${i - 12}PM`,
    calls: callsByHour[i] || 0
  }));

  const maxCallsHour = Math.max(...hourlyData.map(h => h.calls), 10); // set minimum scale to 10 so 1 call doesn't fill 100%

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-8 flex flex-col w-full">
      <div className="w-full flex-1 flex flex-col">
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-[var(--bolt-border-color)] gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <BrandLogo className="scale-125 origin-left" />
            <h1 className="text-xl font-bold text-[var(--bolt-text-primary)] ml-4 border-l border-[var(--bolt-border-color)] pl-4">Admin Portal</h1>
          </div>
          <div className="flex gap-6 overflow-x-auto w-full md:w-auto px-1 hide-scrollbar">
            <button
              className={`pb-2 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === "approvals" ? "text-[var(--bolt-accent)]" : "text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]"
              }`}
              onClick={() => setActiveTab("approvals")}
            >
              Payment Approvals
              {pendingApprovals.length > 0 && (
                <span className="ml-2 bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded-full border border-red-500/20">
                  {pendingApprovals.length}
                </span>
              )}
              {activeTab === "approvals" && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--bolt-accent)] rounded-t-full" />
              )}
            </button>
            <button
              className={`pb-2 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === "analytics" ? "text-[var(--bolt-accent)]" : "text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]"
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              Call Analytics
              {activeTab === "analytics" && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--bolt-accent)] rounded-t-full" />
              )}
            </button>
            <button
              className={`pb-2 text-sm font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === "users" ? "text-[var(--bolt-accent)]" : "text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]"
              }`}
              onClick={() => setActiveTab("users")}
            >
              User Management
              {activeTab === "users" && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--bolt-accent)] rounded-t-full" />
              )}
            </button>
          </div>
        </header>

        {activeTab === "approvals" && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard className="p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-[var(--bolt-text-secondary)] mb-2">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <span className="text-sm font-medium uppercase tracking-wider">Total Approved</span>
                </div>
                <div className="text-4xl font-bold text-[var(--bolt-text-primary)]">{approvedPayments.length} Users</div>
              </GlassCard>
              <GlassCard className="p-6 flex flex-col justify-center border-[var(--bolt-accent)]/20">
                <div className="flex items-center gap-3 text-[var(--bolt-text-secondary)] mb-2">
                  <TrendingUp size={18} className="text-[var(--bolt-accent)]" />
                  <span className="text-sm font-medium uppercase tracking-wider">Total Revenue Received</span>
                </div>
                <div className="text-4xl font-bold text-[var(--bolt-accent)]">₹{(approvedPayments.length * 150).toLocaleString()}</div>
                <p className="text-xs text-[var(--bolt-text-secondary)] mt-2">Based on ₹150 / user subscription</p>
              </GlassCard>
            </div>

            {/* Pending Approvals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Pending Approvals</h2>
                <button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-pending-approvals"] })}
                  className="text-xs text-[var(--bolt-accent)] hover:underline"
                >
                  Refresh
                </button>
              </div>

              {isLoadingApprovals ? (
                <div className="text-center py-20 text-[var(--bolt-text-secondary)]">Loading...</div>
              ) : pendingApprovals.length === 0 ? (
                <GlassCard className="p-12 text-center text-[var(--bolt-text-secondary)] flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 mb-4 opacity-50" />
                  <p>No pending approvals. You're all caught up!</p>
                </GlassCard>
              ) : (
                <div className="bg-[var(--bolt-bg-depth-1)] rounded-xl border border-[var(--bolt-border-color)] overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--bolt-bg-depth-2)] text-[var(--bolt-text-secondary)] border-b border-[var(--bolt-border-color)]">
                      <tr>
                        <th className="px-6 py-4 font-medium">User Email</th>
                        <th className="px-6 py-4 font-medium">UTR Number</th>
                        <th className="px-6 py-4 font-medium">Date Submitted</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--bolt-border-color)]">
                      {pendingApprovals.map((sub: any) => (
                        <tr key={sub.user_email} className="hover:bg-[var(--bolt-bg-depth-2)] transition-colors">
                          <td className="px-6 py-4 font-medium text-[var(--bolt-text-primary)]">{sub.user_email}</td>
                          <td className="px-6 py-4 font-mono text-[var(--bolt-accent)]">{sub.utr_number}</td>
                          <td className="px-6 py-4 text-[var(--bolt-text-secondary)]">
                            {format(parseISO(sub.updated_at), "MMM dd, yyyy h:mm a")}
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button
                              onClick={() => approveMutation.mutate({ email: sub.user_email, action: "reject" })}
                              disabled={approveMutation.isPending}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                            <button
                              onClick={() => approveMutation.mutate({ email: sub.user_email, action: "approve" })}
                              disabled={approveMutation.isPending}
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors flex items-center gap-2 font-medium"
                            >
                              <CheckCircle size={18} /> Approve
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Approved Payments */}
            <div className="space-y-4 pt-6 border-t border-[var(--bolt-border-color)]">
              <h2 className="text-xl font-semibold">Approved Payments History</h2>
              
              {approvedPayments.length === 0 ? (
                <div className="text-sm text-[var(--bolt-text-secondary)]">No approved payments found.</div>
              ) : (
                <div className="bg-[var(--bolt-bg-depth-1)] rounded-xl border border-[var(--bolt-border-color)] overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--bolt-bg-depth-2)] text-[var(--bolt-text-secondary)] border-b border-[var(--bolt-border-color)]">
                      <tr>
                        <th className="px-6 py-4 font-medium">User Email</th>
                        <th className="px-6 py-4 font-medium">UTR Number</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Date Approved</th>
                        <th className="px-6 py-4 font-medium">Expires On</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--bolt-border-color)]">
                      {approvedPayments.map((sub: any) => (
                        <tr key={sub.user_email} className="hover:bg-[var(--bolt-bg-depth-2)] transition-colors opacity-80 hover:opacity-100">
                          <td className="px-6 py-4 font-medium text-[var(--bolt-text-primary)]">{sub.user_email}</td>
                          <td className="px-6 py-4 font-mono text-gray-400">{sub.utr_number || "Manual"}</td>
                          <td className="px-6 py-4">
                            {sub.status === "paused" ? (
                              <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-0.5 rounded-full border border-orange-500/20">Paused</span>
                            ) : (
                              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20">Active</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[var(--bolt-text-secondary)]">
                            {format(parseISO(sub.updated_at), "MMM dd, yyyy")}
                          </td>
                          <td className="px-6 py-4 text-[var(--bolt-text-secondary)]">
                            {sub.expires_at ? format(parseISO(sub.expires_at), "MMM dd, yyyy") : "Lifetime"}
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2">
                            {sub.status === "paused" ? (
                              <button
                                onClick={() => approveMutation.mutate({ email: sub.user_email, action: "resume" })}
                                disabled={approveMutation.isPending}
                                className="text-xs px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors font-medium border border-emerald-500/20"
                              >
                                Resume Access
                              </button>
                            ) : (
                              <button
                                onClick={() => approveMutation.mutate({ email: sub.user_email, action: "pause" })}
                                disabled={approveMutation.isPending}
                                className="text-xs px-3 py-1.5 rounded-md bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors font-medium border border-orange-500/20"
                              >
                                Pause Access
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Call Tracker</h2>
              <div className="flex bg-[#111] p-1 rounded-lg border border-[#333]">
                <button
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    period === "daily" ? "bg-[#EAB308] text-black" : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setPeriod("daily")}
                >
                  Today
                </button>
                <button
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    period === "weekly" ? "bg-[#EAB308] text-black" : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setPeriod("weekly")}
                >
                  This Week
                </button>
                <button
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    period === "monthly" ? "bg-[#EAB308] text-black" : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setPeriod("monthly")}
                >
                  This Month
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 text-gray-400 mb-2">
                  <PhoneCall size={18} />
                  <span className="text-sm font-medium uppercase tracking-wider">Total Calls</span>
                </div>
                <div className="text-4xl font-bold">{periodTotalCalls}</div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center gap-3 text-gray-400 mb-2">
                  <Users size={18} />
                  <span className="text-sm font-medium uppercase tracking-wider">Active Callers</span>
                </div>
                <div className="text-4xl font-bold">{Object.keys(callerStats).length}</div>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex items-center gap-3 text-gray-400 mb-2">
                  <TrendingUp size={18} />
                  <span className="text-sm font-medium uppercase tracking-wider">
                    {period === "daily" ? "Avg Calls / Hour" : "Avg Calls / Day"}
                  </span>
                </div>
                <div className="text-4xl font-bold">
                  {period === "daily"
                    ? (periodTotalCalls / Math.max(1, new Date().getHours())).toFixed(1)
                    : (periodTotalCalls / (period === "weekly" ? 7 : 30)).toFixed(1)}
                </div>
              </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leaderboard */}
              <GlassCard className="p-0 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-[#333] flex items-center gap-2">
                  <BarChart2 size={18} className="text-[#EAB308]" />
                  <h3 className="font-semibold">Top 10 Callers</h3>
                </div>
                <div className="flex-1 overflow-auto max-h-[400px]">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#1a1a1a] text-gray-400 sticky top-0">
                      <tr>
                        <th className="px-5 py-3">Rank</th>
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3 text-right">Calls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222]">
                      {topCallers.map((c, i) => (
                        <tr key={c.name} className="hover:bg-white/5 transition-colors">
                          <td className="px-5 py-3 font-medium text-gray-500">#{i + 1}</td>
                          <td className="px-5 py-3 font-medium text-white">{c.name}</td>
                          <td className="px-5 py-3 text-right font-bold text-[#EAB308]">{c.calls}</td>
                        </tr>
                      ))}
                      {topCallers.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-5 py-8 text-center text-gray-500">No calls recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {/* Daily / Period Trend */}
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <Calendar size={18} className="text-[var(--bolt-accent)]" />
                  {period === "daily" ? "Today's Trend" : period === "weekly" ? "This Week's Trend" : "This Month's Trend"}
                </h3>
                <div className="flex items-end justify-between h-56 md:h-64 gap-1 md:gap-2 pb-6">
                  {trendDays.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full">
                      <div className="absolute -top-8 bg-[#222] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                        {d.calls} calls
                      </div>
                      <div className="w-full bg-[#1a1a1a] rounded-t-sm flex items-end justify-center overflow-hidden h-full">
                        <div 
                          className="w-full bg-[var(--bolt-accent)] transition-all duration-500 rounded-t-sm hover:opacity-80"
                          style={{ height: `${d.calls === 0 ? 0 : Math.max(2, (d.calls / maxCallsDay) * 100)}%` }}
                        />
                      </div>
                      <div className={`text-[9px] md:text-[10px] text-gray-400 whitespace-nowrap absolute -bottom-6 transition-opacity ${(period === 'monthly' && i % 3 !== 0) || (period === 'daily' && i % 4 !== 0) ? 'opacity-0 group-hover:opacity-100' : 'opacity-50 group-hover:opacity-100'}`}>
                        {d.name}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Call Activity Heatmap (24 hours) - Only show for weekly/monthly to avoid duplicate daily info */}
            {period !== "daily" && (
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-6 flex items-center gap-2">
                  <Clock size={18} className="text-[var(--bolt-accent)]" />
                  Best Times to Call ({period === "weekly" ? "This Week" : "This Month"})
                </h3>
                <p className="text-xs text-gray-400 mb-4 -mt-4">Cumulative call volume by hour of day</p>
                <div className="flex items-end justify-between h-48 gap-1 md:gap-2 pb-6">
                  {hourlyData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full">
                      <div className="absolute -top-8 bg-[#222] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {d.calls} calls
                      </div>
                      <div className="w-full bg-[#1a1a1a] rounded-t-sm flex items-end justify-center overflow-hidden h-full">
                        <div 
                          className="w-full bg-[var(--bolt-accent)] transition-all duration-500 rounded-t-sm hover:opacity-80"
                          style={{ 
                            height: `${d.calls === 0 ? 0 : Math.max(2, (d.calls / maxCallsHour) * 100)}%`, 
                            opacity: d.calls === 0 ? 0 : 0.4 + (d.calls / maxCallsHour) * 0.6 
                          }}
                        />
                      </div>
                      <div className={`text-[9px] text-gray-500 absolute -bottom-6 ${i % 2 !== 0 ? 'hidden md:block' : ''}`}>
                        {d.label}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Management</h2>
              <button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}
                className="text-xs text-[#EAB308] hover:underline"
              >
                Refresh
              </button>
            </div>

            <GlassCard className="p-6 mb-6 inline-block">
              <div className="flex items-center gap-3 text-gray-400 mb-1">
                <Users size={18} />
                <span className="text-sm font-medium uppercase tracking-wider">Total CRM Users</span>
              </div>
              <div className="text-4xl font-bold">{allUsers.length}</div>
            </GlassCard>

            {isLoadingUsers ? (
              <div className="text-center py-20 text-gray-500">Loading users...</div>
            ) : (
              <div className="bg-[#111] rounded-xl border border-[#333] overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#1a1a1a] text-gray-400 border-b border-[#333]">
                    <tr>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium text-right">Lifetime Calls</th>
                      <th className="px-6 py-4 font-medium">Subscription</th>
                      <th className="px-6 py-4 font-medium">Days Left</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {allUsers.map((user: any) => {
                      const sub = user.subscription;
                      
                      let daysLeft = 0;
                      let subStatus = "No Data";
                      let statusColor = "text-gray-500";
                      
                      if (sub) {
                        subStatus = sub.status;
                        if (subStatus === "active" && sub.expires_at) {
                          const ms = new Date(sub.expires_at).getTime() - new Date().getTime();
                          daysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
                          if (daysLeft === 0) subStatus = "expired";
                        }
                        
                        if (subStatus === "active") statusColor = "text-green-500";
                        else if (subStatus === "pending") statusColor = "text-[#EAB308]";
                        else if (subStatus === "expired" || subStatus === "inactive") statusColor = "text-red-500";
                      }
                      
                      return (
                        <tr key={user.email || user.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-medium">{user.name || "-"}</td>
                          <td className="px-6 py-4 text-gray-400">{user.email}</td>
                          <td className="px-6 py-4 text-right font-bold text-white">{user.total_calls_made || 0}</td>
                          <td className="px-6 py-4">
                            <span className={`capitalize font-medium ${statusColor}`}>
                              {subStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {daysLeft > 0 ? (
                              <span className="font-bold text-white">{daysLeft} days</span>
                            ) : (
                              <span className="text-gray-600">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end">
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete user ${user.email} and ALL their data?`)) {
                                  deleteUserMutation.mutate(user.email);
                                }
                              }}
                              disabled={deleteUserMutation.isPending}
                              className="px-3 py-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
