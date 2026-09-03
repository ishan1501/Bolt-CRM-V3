"use client";

import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Spinner } from "@/components/ui/spinner";
import { LeadsTable } from "@/components/leads/leads-table";
import { useMemo } from "react";
import { useUIStore } from "@/stores/ui-store";
import { CustomizeColumnsDrawer } from "@/components/leads/customize-columns-drawer";
import { TableToolbar } from "@/components/leads/table-toolbar";
import { BulkActionBar } from "@/components/leads/bulk-action-bar";
import { FilterLeadsDrawer } from "@/components/leads/filter-leads-drawer";
import { LeadDrawer } from "@/components/leads/lead-drawer";
import { queryKeys } from "@/lib/query-keys";

import { useViewStore } from "@/stores/view-store";

export default function ApplicationsPage() {
  const { searchQuery, programFilters, stageFilters } = useUIStore();
  const { views, activeViewId } = useViewStore();

  const activeView = views.find(v => v.id === activeViewId);

  const { data: allApps, isLoading, error } = useQuery({
    queryKey: ["allApplications", activeView?.backendFilterPayload, activeView?.columns],
    queryFn: () => {
      const payload = activeView?.backendFilterPayload || {};
      return crmApi.fetchAllApplications({ ...payload, columns: activeView?.columns, viewUuid: "88292dcd-5813-4163-9683-fcc0efe783e7" });
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache to avoid over-querying on window focus
  });

  const { data: stages = [] } = useQuery({
    queryKey: queryKeys.stages(),
    queryFn: () => crmApi.fetchStages(),
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
      <TableToolbar 
        totalRecords={filteredApps.length} 
        uniquePrograms={uniquePrograms} 
        stages={stages} 
        referrer="manageApplicants"
      />
      
      <GlassCard className="flex-1 flex flex-col overflow-hidden p-0 border border-[var(--bolt-border-color)]">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Spinner size={40} />
          </div>
        ) : (
          <div className="flex-1 overflow-auto relative group">
            <LeadsTable leads={filteredApps} />
          </div>
        )}
      </GlassCard>

      <BulkActionBar stages={stages} allLeads={allApps || []} />
      <CustomizeColumnsDrawer />
      <FilterLeadsDrawer />
      <LeadDrawer />
    </div>
  );
}
