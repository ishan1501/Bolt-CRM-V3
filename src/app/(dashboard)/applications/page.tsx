"use client";

import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Spinner } from "@/components/ui/spinner";
import { ApplicationsTable } from "@/components/applications/applications-table";
import { useMemo } from "react";
import { useUIStore } from "@/stores/ui-store";
import { MultiSelect } from "@/components/ui/multi-select";

export default function ApplicationsPage() {
  const { searchQuery, programFilters, stageFilters, toggleProgramFilter, clearProgramFilters, toggleStageFilter, clearStageFilters } = useUIStore();

  const { data: allApps, isLoading, error } = useQuery({
    queryKey: ["allApplications"],
    queryFn: () => crmApi.fetchAllApplications(),
  });

  const uniquePrograms = useMemo(() => {
    if (!allApps) return [];
    const programs = new Set<string>();
    allApps.forEach(app => {
      const prog = app.form_title || (app as any).formTitle;
      if (prog) programs.add(prog);
    });
    return Array.from(programs).sort();
  }, [allApps]);

  const uniqueStages = useMemo(() => {
    if (!allApps) return [];
    const stages = new Set<string>();
    allApps.forEach(app => {
      const stage = (app as any).applicationStageName || app.application_stage_name || app.stage_name;
      if (stage) stages.add(stage);
    });
    return Array.from(stages).sort();
  }, [allApps]);

  const filteredApps = useMemo(() => {
    if (!allApps) return [];
    let result = allApps;
    
    if (programFilters.length > 0) {
      result = result.filter(app => programFilters.includes(app.form_title || (app as any).formTitle));
    }
    
    if (stageFilters.length > 0) {
      result = result.filter(app => stageFilters.includes((app as any).applicationStageName || app.application_stage_name || app.stage_name));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.registered_name?.toLowerCase().includes(q) ||
          app.registered_email?.toLowerCase().includes(q) ||
          app.registered_mobile?.toLowerCase().includes(q) ||
          app.form_title?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allApps, searchQuery, programFilters, stageFilters]);

  if (error) {
    return (
      <div className="p-4 bg-red-100/50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
        Failed to load applications: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-4 relative h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 surface-1 border border-[var(--bolt-border-color)] rounded-xl shadow-sm mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-[var(--bolt-text-secondary)] px-1 py-1.5 text-sm font-medium">
            Showing <span className="text-slate-900 dark:text-slate-100">{filteredApps.length}</span> Applications
          </div>
          
          <MultiSelect 
            label="All Programs"
            options={uniquePrograms}
            selectedValues={programFilters}
            onToggle={toggleProgramFilter}
            onClear={clearProgramFilters}
          />
          
          <MultiSelect 
            label="All Stages"
            options={uniqueStages}
            selectedValues={stageFilters}
            onToggle={toggleStageFilter}
            onClear={clearStageFilters}
          />
        </div>
      </div>
      
      <GlassCard className="flex-1 flex flex-col overflow-hidden p-0 border border-[var(--bolt-border-color)]">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Spinner size={40} />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden relative group">
            <ApplicationsTable apps={filteredApps} />
          </div>
        )}
      </GlassCard>

    </div>
  );
}
