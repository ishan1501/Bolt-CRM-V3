"use client";

import { useDebugStore } from "@/stores/debug-store";
import { format } from "date-fns";
import { Trash2, Copy, AlertCircle, Info, Activity } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function DebugSettings() {
  const { logs, clearLogs } = useDebugStore();
  const [filter, setFilter] = useState<"all" | "error" | "api">("all");

  const filteredLogs = logs.filter(
    (log) => filter === "all" || log.type === filter
  );

  const copyToClipboard = () => {
    const text = JSON.stringify(logs, null, 2);
    navigator.clipboard.writeText(text);
    toast.success("Logs copied to clipboard!");
  };

  return (
    <div className="space-y-6 h-full flex flex-col max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-red-500">Debug Center</h1>
          <p className="text-[var(--bolt-text-secondary)]">
            View raw API responses and errors here to share with the developer.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Copy size={16} /> Copy All
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
          >
            <Trash2 size={16} /> Clear Logs
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "error", "api"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium capitalize transition",
              filter === f
                ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#1a1a1a] dark:text-slate-400"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="text-[var(--bolt-text-secondary)] flex flex-col items-center justify-center h-full">
              <Activity size={48} className="mb-4 opacity-50" />
              <p>No logs recorded yet.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={cn(
                  "p-4 rounded-lg text-sm font-mono border-l-4",
                  log.type === "error"
                    ? "bg-red-950/50 border-red-500 text-red-200"
                    : log.type === "api"
                    ? "bg-emerald-950/30 border-emerald-500 text-emerald-200"
                    : "bg-blue-950/30 border-blue-500 text-blue-200"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold">
                    {log.type === "error" && <AlertCircle size={16} className="text-red-500" />}
                    {log.type === "api" && <Activity size={16} className="text-emerald-500" />}
                    {log.type === "info" && <Info size={16} className="text-blue-500" />}
                    [{log.source}] {log.message}
                  </div>
                  <div className="text-[var(--bolt-text-secondary)] text-xs">
                    {format(new Date(log.timestamp), "HH:mm:ss.SSS")}
                  </div>
                </div>
                {log.details && (
                  <pre className="mt-2 bg-[var(--bolt-bg-depth-4)] p-3 rounded overflow-x-auto text-xs opacity-90 text-[var(--bolt-text-primary)] font-mono">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
