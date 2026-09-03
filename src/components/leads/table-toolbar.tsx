import { useViewStore } from "@/stores/view-store";
import { useUIStore } from "@/stores/ui-store";
import { Columns } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { LeadStage } from "@/types/crm";
import { MultiSelect } from "@/components/ui/multi-select";
import { SingleSelect } from "@/components/ui/single-select";

interface TableToolbarProps {
  totalRecords: number;
  uniquePrograms?: string[];
  stages?: LeadStage[] | string[];
  referrer?: string;
}

export function TableToolbar({ totalRecords, uniquePrograms = [], stages = [], referrer = "manageLeads" }: TableToolbarProps) {
  const { 
    views, 
    activeViewId, 
    setActiveView, 
    setCustomizeColumnsOpen, 
    syncBackendViews,
    removeView
  } = useViewStore();
  
  const { programFilters, toggleProgramFilter, clearProgramFilters, stageFilters, toggleStageFilter, clearStageFilters } = useUIStore();
  
  useEffect(() => {
    views.forEach(v => {
      if (v.name.startsWith("{")) {
        removeView(v.id);
      }
    });
  }, [views, removeView]);

  useQuery({
    queryKey: ["savedFilters", referrer],
    queryFn: async () => {
      const { crmApi } = await import("@/lib/api");
      const backendViews = await crmApi.fetchSavedViews(referrer);
      if (backendViews && backendViews.length > 0) {
        syncBackendViews(backendViews, referrer);
      }
      return backendViews;
    },
    staleTime: 1000 * 60 * 5 // 5 mins
  });

  const filteredViews = views.filter(v => v.id === 'default' || v.referrer === referrer);

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 p-3 surface-2 rounded-xl mb-4">
      <div className="flex items-center flex-wrap gap-2 md:gap-4 w-full sm:w-auto">
        <div className="text-[var(--bolt-text-secondary)] px-1 py-1.5 text-sm font-medium shrink-0">
          Showing <span className="text-[var(--bolt-text-primary)]">{totalRecords}</span> Records
        </div>

        <SingleSelect 
          value={activeViewId}
          onChange={setActiveView}
          options={filteredViews.map(v => ({ label: v.name, value: v.id }))}
          placeholder="Select View..."
        />
        
        <MultiSelect 
          label="All Programs"
          options={uniquePrograms}
          selectedValues={programFilters}
          onToggle={toggleProgramFilter}
          onClear={clearProgramFilters}
        />
        
        <MultiSelect 
          label="All Stages"
          options={stages.map(s => typeof s === 'string' ? s : s.stageName)}
          selectedValues={stageFilters}
          onToggle={toggleStageFilter}
          onClear={clearStageFilters}
        />
      </div>

      <div className="hidden md:flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <button 
          onClick={() => setCustomizeColumnsOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg surface-3 hover:bg-[var(--bolt-hover-overlay)] transition-colors"
          title="Customize Columns"
        >
          <Columns size={16} className="text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]" />
        </button>
      </div>
    </div>
  );
}
