"use client";

import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { GlassCard } from "@/components/ui/glass-card";
import { Spinner } from "@/components/ui/spinner";
import { LeadsTable } from "@/components/leads/leads-table";
import { BulkActionBar } from "@/components/leads/bulk-action-bar";
import { TableToolbar } from "@/components/leads/table-toolbar";
import { CustomizeColumnsDrawer } from "@/components/leads/customize-columns-drawer";
import { FilterLeadsDrawer } from "@/components/leads/filter-leads-drawer";
import { LeadDrawer } from "@/components/leads/lead-drawer";
import { useUIStore } from "@/stores/ui-store";
import { useViewStore } from "@/stores/view-store";
import { Lead } from "@/types/crm";
import { useMemo, useEffect } from "react";

function extractLeads(raw: unknown): Lead[] {
  if (!raw) return [];
  const r = raw as Record<string, any>;
  let leads: any[] = [];

  if (r.data?.result && Array.isArray(r.data.result)) leads = r.data.result;
  else if (r.data?.data?.result && Array.isArray(r.data.data.result)) leads = r.data.data.result;
  else if (Array.isArray(r.data)) leads = r.data;
  else if (Array.isArray(r.result)) leads = r.result;
  else if (Array.isArray(r)) leads = r as Lead[];
  else if (r.data?.leads && Array.isArray(r.data.leads)) leads = r.data.leads;
  
  return leads;
}

export default function LeadsPage() {
  const { searchQuery, programFilters, stageFilters } = useUIStore();
  const { views, activeViewId } = useViewStore();

  const activeView = views.find(v => v.id === activeViewId);

  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ["allLeads", activeView?.backendFilterPayload, activeView?.columns],
    queryFn: () => {
      const payload = activeView?.backendFilterPayload || {};
      return crmApi.fetchAllLeads({ ...payload, columns: activeView?.columns, viewUuid: "ef0f1127-dd36-4b85-afde-30bbf2b9079f" });
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: stages = [] } = useQuery({
    queryKey: queryKeys.stages(),
    queryFn: () => crmApi.fetchStages(),
  });

  const allLeads = useMemo(() => {
    if (!rawData) return [];
    if (Array.isArray(rawData)) return rawData;
    return extractLeads(rawData);
  }, [rawData]);


  const uniquePrograms = useMemo(() => {
    const programs = new Set<string>();
    allLeads.forEach(lead => {
      const prog = lead.form_title || (lead as any).formTitle;
      if (prog) programs.add(prog);
    });
    return Array.from(programs).sort();
  }, [allLeads]);

  // Apply filters and search
  const filteredLeads = useMemo(() => {
    let result = allLeads;

    // Apply active view filters only if it's a local filter view (no backend payload)
    if (activeView && !activeView.backendFilterPayload && activeView.filters.length > 0) {
      result = result.filter(lead => {
        const matches = activeView.filters.map(f => {
          let val = (lead as any)[f.field] || (lead as any)[f.field.replace(/_([a-z])/g, (g:string) => g[1].toUpperCase())] || "";
          val = String(val).toLowerCase();
          const target = String(f.value).toLowerCase();

          switch (f.condition) {
            case "is exactly": return val === target;
            case "is not": return val !== target;
            case "contains": return val.includes(target);
            case "does not contain": return !val.includes(target);
            case "is empty": return !val;
            case "is not empty": return !!val;
            case "Before": 
              if (!val || !target) return false;
              return new Date(val).getTime() < new Date(target).getTime();
            case "After":
              if (!val || !target) return false;
              return new Date(val).getTime() > new Date(target).getTime();
            case "Between":
              if (!val || !target) return false;
              const [start, end] = target.split(',');
              if (!start || !end) return false;
              const time = new Date(val).getTime();
              return time >= new Date(start).getTime() && time <= new Date(end).getTime();
            default: return true;
          }
        });

        if (activeView.matchType === "any") {
          return matches.some(m => m);
        } else {
          return matches.every(m => m);
        }
      });
    }

    if (programFilters.length > 0) {
      result = result.filter(lead => programFilters.includes(lead.form_title || (lead as any).formTitle));
    }
    
    if (stageFilters.length > 0) {
      result = result.filter(lead => stageFilters.includes(lead.stage_name || (lead as any).stageName));
    }

    // Apply global search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.registered_name?.toLowerCase().includes(q) ||
          lead.registered_email?.toLowerCase().includes(q) ||
          lead.registered_mobile?.toLowerCase().includes(q) ||
          lead.form_title?.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [allLeads, searchQuery, activeView, programFilters, stageFilters]);

  const { setCurrentLeadList } = useUIStore();

  useEffect(() => {
    setCurrentLeadList(filteredLeads);
  }, [filteredLeads, setCurrentLeadList]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px] text-red-500">
        Failed to load leads: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-4 relative h-full flex flex-col">
      <TableToolbar totalRecords={filteredLeads.length} uniquePrograms={uniquePrograms} stages={stages} />
      
      <GlassCard className="flex-1 flex flex-col overflow-hidden p-0 border border-[var(--bolt-border-color)]">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <Spinner size={40} />
          </div>
        ) : (
          <div className="flex-1 overflow-auto relative group">
            <LeadsTable leads={filteredLeads} />
          </div>
        )}
      </GlassCard>

      <BulkActionBar stages={stages} allLeads={allLeads} />
      <CustomizeColumnsDrawer />
      <FilterLeadsDrawer />
      <LeadDrawer />
    </div>
  );
}
