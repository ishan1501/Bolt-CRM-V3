"use client";

import { GlassCard } from "../ui/glass-card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useState } from "react";
import { cn } from "@/lib/utils";

const MOCK_DATA = [
  { name: "Mon", conversions: 12, drops: 2 },
  { name: "Tue", conversions: 19, drops: 3 },
  { name: "Wed", conversions: 15, drops: 1 },
  { name: "Thu", conversions: 22, drops: 5 },
  { name: "Fri", conversions: 30, drops: 2 },
  { name: "Sat", conversions: 10, drops: 1 },
  { name: "Sun", conversions: 8, drops: 0 },
];

export function VelocityTracker() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  return (
    <GlassCard className="h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Conversion Velocity</h3>
        <div className="flex surface-3 p-1 rounded-lg">
          {(["daily", "weekly", "monthly"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors",
                period === p 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-[var(--bolt-text-secondary)] hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50">
          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Avg Time to Convert</div>
          <div className="text-2xl font-bold mt-1">4.2 Days</div>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Conversion Rate</div>
          <div className="text-2xl font-bold mt-1">24.8%</div>
        </div>
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Stage Transitions</div>
          <div className="text-2xl font-bold mt-1">1,240</div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
            <YAxis axisLine={false} tickLine={false} className="text-xs" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
              itemStyle={{ color: '#fff' }}
              cursor={{ fill: 'rgba(15, 23, 42, 0.05)' }}
            />
            <Bar dataKey="conversions" fill="#10b981" radius={[4, 4, 0, 0]} name="Conversions" />
            <Bar dataKey="drops" fill="#ef4444" radius={[4, 4, 0, 0]} name="Drops" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
