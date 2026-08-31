"use client";

import { useState } from "react";
import { LeadStage } from "@/types/crm";
import { cn } from "@/lib/utils";
import { ChevronDown, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";

interface StagePillProps {
  currentStageName: string;
  leadUuid: string;
  stages: LeadStage[];
}

export function StagePill({ currentStageName, leadUuid, stages }: StagePillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (stage: LeadStage) => crmApi.changeLeadStage([leadUuid], stage),
    onMutate: async (newStage) => {
      // Optimistic update logic
      await queryClient.cancelQueries({ queryKey: ["allLeads"] });
      await queryClient.cancelQueries({ queryKey: ["allApplications"] });
      
      const updateData = (old: any) => {
        if (!old) return old;
        
        // Handle array format directly (which is what our new auto-paginating API returns)
        if (Array.isArray(old)) {
          return old.map((l: any) => 
            l.uuid === leadUuid || l.id === leadUuid ? { 
              ...l, 
              stage_name: newStage.stageName,
              application_stage_name: newStage.stageName, // Update application stage too just in case
              sub_stage_name: newStage.LeadSubStages?.[0]?.subStageName || null
            } : l
          );
        }
        
        // Fallback for old paginated format just in case
        if (old?.data?.result) {
          return {
            ...old,
            data: {
              ...old.data,
              result: old.data.result.map((l: any) => 
                l.uuid === leadUuid || l.id === leadUuid ? { 
                  ...l, 
                  stage_name: newStage.stageName,
                  application_stage_name: newStage.stageName,
                  sub_stage_name: newStage.LeadSubStages?.[0]?.subStageName || null
                } : l
              )
            }
          };
        }
        
        return old;
      };

      // We need to update all instances of the query (regardless of the filter payload)
      const queryCache = queryClient.getQueryCache();
      
      queryCache.findAll({ queryKey: ["allLeads"] }).forEach(query => {
        queryClient.setQueryData(query.queryKey, updateData);
      });
      
      queryCache.findAll({ queryKey: ["allApplications"] }).forEach(query => {
        queryClient.setQueryData(query.queryKey, updateData);
      });
      
      return { previous: null }; // We don't rollback perfectly across all keys yet
    },
    onSuccess: (data, variables) => {
      setIsOpen(false);
      toast.success(`Stage updated to ${variables.stageName} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["allLeads"] });
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
    },
    onError: () => {
      toast.error("Failed to update stage");
      queryClient.invalidateQueries({ queryKey: ["allLeads"] });
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
    }
  });

  const getStageColor = (name: string) => {
    const l = name.toLowerCase();
    if (l.includes("admit") || l.includes("enroll") || l.includes("hot") || l.includes("done")) 
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
    if (l.includes("reject") || l.includes("drop") || l.includes("cold") || l.includes("not")) 
      return "bg-red-500/10 text-red-400 border border-red-500/25";
    if (l.includes("review") || l.includes("progress") || l.includes("warm") || l.includes("chat")) 
      return "bg-orange-500/10 text-orange-400 border border-orange-500/25";
    
    // Default neutral pill
    return "bg-[var(--bolt-bg-depth-3)] text-[var(--bolt-text-secondary)] border border-[var(--bolt-border-color)]";
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={mutation.isPending}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors hover:opacity-80 max-w-[160px]",
          getStageColor(currentStageName || "")
        )}
        title={currentStageName}
      >
        {mutation.isPending ? <Loader2 size={12} className="animate-spin shrink-0" /> : null}
        <span className="truncate">{currentStageName || "Unknown"}</span>
        <ChevronDown size={12} className="opacity-50 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <div className="absolute top-full left-0 mt-1 w-48 surface-3 rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-100 border border-[var(--bolt-border-color)]">
            {stages.map((stage) => (
              <button
                key={stage.uuid}
                onClick={(e) => {
                  e.stopPropagation();
                  mutation.mutate(stage);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:surface-2 transition-colors text-[var(--bolt-text-primary)]"
              >
                {stage.stageName}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
