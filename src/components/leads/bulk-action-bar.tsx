"use client";

import { useUIStore } from "@/stores/ui-store";
import { Lead, LeadStage } from "@/types/crm";
import { GlassCard } from "../ui/glass-card";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface BulkActionBarProps {
  stages: LeadStage[];
  allLeads?: Lead[];
}

export function BulkActionBar({ stages, allLeads = [] }: BulkActionBarProps) {
  const { selectedLeadIds, clearSelection } = useUIStore();
  const [selectedStageId, setSelectedStageId] = useState("");
  const [selectedSubStageId, setSelectedSubStageId] = useState("");
  const queryClient = useQueryClient();

  const selectedStage = stages.find(s => s.uuid === selectedStageId);
  const subStages = selectedStage?.LeadSubStages || [];

  const bulkMutation = useMutation({
    mutationFn: (stage: LeadStage) => crmApi.changeLeadStage(Array.from(selectedLeadIds), stage),
    onSuccess: (data, variables) => {
      toast.success(`Successfully queued stage update to ${variables.stageName} for ${selectedLeadIds.size} leads!`);
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ["allLeads"] });
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
    },
    onError: () => {
      toast.error("Failed to execute bulk stage update");
    }
  });

  if (selectedLeadIds.size === 0) return null;

  const handleApply = () => {
    if (!selectedStage) return;
    
    const stageToSave = { 
      uuid: selectedStage.uuid,
      stageName: selectedStage.stageName,
      LeadSubStages: [] as any[]
    };
    if (selectedSubStageId) {
      const sub = subStages.find(s => s.uuid === selectedSubStageId);
      if (sub) {
        stageToSave.LeadSubStages = [{
          uuid: sub.uuid,
          subStageName: sub.subStageName || sub.name || (sub as any).stageName || (sub as any).sub_stage_name
        }];
      }
    }
    
    bulkMutation.mutate(stageToSave);
  };


  return (
    <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 w-[95%] md:w-auto max-w-4xl">
      <GlassCard depth={3} className="py-3 px-4 md:px-6 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 rounded-2xl md:rounded-full shadow-2xl border-[var(--bolt-border-color)]">
        
        {/* Header / Selection Count Area */}
        <div className="flex items-center justify-between md:justify-start md:border-r border-[var(--bolt-border-color)] md:pr-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--bolt-accent)] shadow-[0_0_8px_var(--bolt-accent-glow)] flex items-center justify-center text-xs text-white font-bold shrink-0">
              {selectedLeadIds.size}
            </div>
            <span className="font-medium text-[var(--bolt-text-primary)] text-sm md:text-base">leads selected</span>
          </div>
          
          {/* Mobile Cancel Button */}
          <Button variant="ghost" size="sm" onClick={clearSelection} className="md:hidden h-8 px-2 text-[var(--bolt-text-secondary)]">
            Cancel
          </Button>
        </div>
        
        {/* Controls Area */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Dropdowns Row (Mobile) / In-line (Desktop) */}
          <div className="flex flex-row gap-2">
            <select 
              className="surface-input rounded-lg px-3 py-1.5 text-xs md:text-sm flex-1 md:w-48 text-[var(--bolt-text-primary)] cursor-pointer"
              value={selectedStageId}
              onChange={(e) => {
                setSelectedStageId(e.target.value);
                setSelectedSubStageId("");
              }}
            >
              <option value="" disabled>Change Stage to...</option>
              {stages.map(s => (
                <option key={s.uuid} value={s.uuid}>{s.stageName}</option>
              ))}
            </select>
            
            {subStages.length > 0 && (
              <select
                className="surface-input rounded-lg px-3 py-1.5 text-xs md:text-sm flex-1 md:w-40 text-[var(--bolt-text-primary)] animate-in zoom-in-95 duration-200 cursor-pointer"
                value={selectedSubStageId}
                onChange={(e) => setSelectedSubStageId(e.target.value)}
              >
                <option value="">No Sub Stage</option>
                {subStages.map(sub => {
                  const label = sub.subStageName || sub.name || (sub as any).stageName || (sub as any).sub_stage_name || "Unknown";
                  return (
                    <option key={sub.uuid} value={sub.uuid}>
                      {label}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
          
          {/* Action Buttons Row */}
          <div className="flex flex-row items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar shrink-0">

            <Button 
              size="sm" 
              onClick={handleApply}
              disabled={!selectedStageId || bulkMutation.isPending}
              className="shrink-0 h-8 md:h-9 px-3 text-xs md:text-sm"
            >
              {bulkMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
              Apply
            </Button>
            
            {/* Desktop Cancel Button */}
            <Button variant="ghost" size="sm" onClick={clearSelection} className="hidden md:inline-flex shrink-0">
              Cancel
            </Button>
          </div>

        </div>
      </GlassCard>
    </div>
  );
}
