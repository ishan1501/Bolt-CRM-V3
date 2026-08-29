"use client";

import { useState, useEffect } from "react";
import { Server, Database, CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { crmApi } from "@/lib/api";

export function SystemStatus() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState({
    crmApi: { status: "unknown", detail: "" },
    supabase: { status: "unknown", detail: "" },
    callSchema: { status: "unknown", detail: "" },
  });

  const checkStatus = async () => {
    setChecking(true);
    const newStatus = { ...status };

    // 1. Check MU CRM API
    try {
      await crmApi.fetchStages();
      newStatus.crmApi = { status: "ok", detail: "Connected to Master's Union" };
    } catch (e: any) {
      newStatus.crmApi = { status: "error", detail: e.message || "Failed to reach CRM API" };
    }

    // 2. Check Supabase DB
    try {
      const { data, error } = await supabase.from("users").select("id").limit(1);
      if (error) throw error;
      newStatus.supabase = { status: "ok", detail: "Database connected" };
    } catch (e: any) {
      newStatus.supabase = { status: "error", detail: e.message || "Database connection failed" };
    }

    // 3. Check Call Log Schema (did they run the SQL?)
    try {
      const { error } = await supabase.from("call_logs").select("lead_name").limit(1);
      if (error) {
        if (error.message.includes("does not exist") || error.code === "42703") {
          newStatus.callSchema = { status: "warning", detail: "Missing lead_name column (Run SQL script)" };
        } else {
          throw error;
        }
      } else {
        newStatus.callSchema = { status: "ok", detail: "Schema is fully updated" };
      }
    } catch (e: any) {
      newStatus.callSchema = { status: "error", detail: e.message || "Schema check failed" };
    }

    setStatus(newStatus);
    setChecking(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const getIcon = (s: string) => {
    if (s === "ok") return <CheckCircle size={20} className="text-emerald-500" />;
    if (s === "warning") return <AlertTriangle size={20} className="text-amber-500" />;
    if (s === "error") return <XCircle size={20} className="text-red-500" />;
    return <RefreshCw size={20} className="text-slate-500 animate-spin" />;
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium text-[var(--bolt-text-primary)] mb-1">System Diagnostics</h3>
        <p className="text-sm text-[var(--bolt-text-secondary)]">
          Real-time health checks for your background connections and database schemas.
        </p>
      </div>

      <button
        onClick={checkStatus}
        disabled={checking}
        className="flex items-center gap-2 px-4 py-2 bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] hover:border-[var(--bolt-accent)]/50 transition-colors rounded-lg text-sm text-[var(--bolt-text-primary)]"
      >
        <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
        {checking ? "Running checks..." : "Rerun Diagnostics"}
      </button>

      <div className="grid gap-4 mt-6">
        {/* CRM API */}
        <div className="p-4 rounded-xl border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-2)] flex items-start gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
            <Server size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-[var(--bolt-text-primary)]">Master's Union API</h4>
              {getIcon(status.crmApi.status)}
            </div>
            <p className="text-sm text-[var(--bolt-text-secondary)]">{status.crmApi.detail || "Checking connection..."}</p>
          </div>
        </div>

        {/* Supabase Core */}
        <div className="p-4 rounded-xl border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-2)] flex items-start gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Database size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-[var(--bolt-text-primary)]">Supabase Database</h4>
              {getIcon(status.supabase.status)}
            </div>
            <p className="text-sm text-[var(--bolt-text-secondary)]">{status.supabase.detail || "Checking connection..."}</p>
          </div>
        </div>

        {/* Supabase Schema */}
        <div className="p-4 rounded-xl border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-2)] flex items-start gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
            <Database size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-[var(--bolt-text-primary)]">Call Logs Schema</h4>
              {getIcon(status.callSchema.status)}
            </div>
            <p className="text-sm text-[var(--bolt-text-secondary)]">{status.callSchema.detail || "Verifying schema..."}</p>
            {status.callSchema.status === "warning" && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-500 font-mono">
                ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS lead_name TEXT DEFAULT 'Unknown Lead';<br/>
                ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS lead_phone TEXT DEFAULT 'Unknown Phone';
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
