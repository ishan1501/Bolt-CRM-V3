"use client";

import { X, ChevronLeft, ChevronRight, Loader2, ChevronDown, PhoneCall, Bookmark, ArrowLeft } from "lucide-react";
import { cn, getBadgeColor } from "@/lib/utils";
import { ProfileTab } from "@/components/leads/drawer-tabs/profile-tab";
import { NotesTab } from "@/components/leads/drawer-tabs/notes-tab";
import { HistoryTab } from "@/components/leads/drawer-tabs/history-tab";
import { RemindersTab } from "@/components/leads/drawer-tabs/reminders-tab";
import { EmailTab } from "@/components/leads/drawer-tabs/email-tab";
import { WhatsAppTab } from "@/components/leads/drawer-tabs/whatsapp-tab";
import { useLeadProfile } from "@/hooks/use-lead-profile";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { LeadProgress } from "@/components/leads/lead-progress";
import { logCallToSupabase } from "@/lib/log-call";
import { useSavedLeadsStore } from "@/stores/saved-leads-store";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import { LeadStage } from "@/types/crm";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "profile", label: "Lead Details" },
  { id: "history", label: "Timeline" },
  { id: "notes", label: "Notes" },
  { id: "reminders", label: "Reminders" },
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
] as const;

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "dd MMM yyyy, hh:mm a");
  } catch {
    return dateStr;
  }
}

export default function LeadDetailsPage({ params }: { params: { uuid: string } }) {
  const uuid = params.uuid;
  const router = useRouter();
  
  const [drawerTab, setDrawerTab] = useState<any>("profile");
  const isSaved = useSavedLeadsStore(state => state.savedLeads.some(l => l.uuid === uuid));
  const { profile, isLoading } = useLeadProfile(uuid);
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: stages = [] } = useQuery({
    queryKey: queryKeys.stages(),
    queryFn: () => crmApi.fetchStages(),
  });

  const selectedStage = stages.find(s => s?.stageName === profile?.stageName);
  const subStages = selectedStage?.LeadSubStages || [];

  const stageChangeMutation = useMutation({
    mutationFn: async (stage: LeadStage) => {
      return crmApi.changeLeadStage([uuid], stage);
    },
    onSuccess: () => {
      toast.success("Stage updated successfully");
      queryClient.invalidateQueries({ queryKey: ["allLeads"] });
      queryClient.invalidateQueries({ queryKey: ["leadProfile", uuid] });
    },
    onError: () => toast.error("Failed to update stage"),
  });

  const handleStageChange = (stageName: string) => {
    const stage = stages.find(s => s.stageName === stageName);
    if (stage) stageChangeMutation.mutate(stage);
  };

  const handleSubStageChange = (subStageName: string) => {
    if (!selectedStage) return;
    const subStage = subStages.find(ss => (ss.subStageName || ss.name || (ss as any).stageName || (ss as any).sub_stage_name) === subStageName);
    if (subStage) {
      stageChangeMutation.mutate({ ...selectedStage, LeadSubStages: [subStage] });
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full h-[calc(100vh-56px)] flex flex-col surface-1">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-2)]">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)] transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back to Leads</span>
        </button>
        
        {profile && (
          <button
            onClick={() => {
              const store = useSavedLeadsStore.getState();
              const savedLead = store.savedLeads.find(l => l.uuid === uuid);
              
              if (savedLead) {
                store.removeLead(uuid, savedLead.dbId);
                toast.success("Lead removed from saved list");
              } else {
                const note = window.prompt("Add a note for this saved lead (optional):");
                if (note !== null) {
                  store.saveLead({
                    uuid: uuid,
                    name: profile.name || 'Unknown',
                    email: profile.email || '',
                    mobile: profile.mobile || '',
                    stageName: profile.stageName || 'Lead',
                    timestamp: Date.now(),
                    note: note
                  });
                  toast.success("Lead saved!");
                }
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-3)] hover:bg-white/5 transition-colors text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-accent)]"
          >
            <Bookmark size={16} className={isSaved ? "fill-current text-[var(--bolt-accent)]" : ""} />
            <span className="text-sm font-medium">{isSaved ? "Saved" : "Save Lead"}</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size={40} />
        </div>
      ) : !profile ? (
        <div className="flex-1 flex items-center justify-center text-[var(--bolt-text-secondary)]">
          Failed to load lead profile data.
        </div>
      ) : (
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* LEFT SIDEBAR */}
          <div className="w-full md:w-80 md:border-r border-b md:border-b-0 border-[var(--bolt-border-color)] flex flex-col surface-2 shrink-0 md:overflow-y-auto h-auto md:h-full">
            <div className="p-6 flex flex-col items-center border-b border-[var(--bolt-border-color)] relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--bolt-accent)] to-[#fde047] flex items-center justify-center text-black text-2xl font-bold shadow-[0_0_20px_var(--bolt-accent-glow)] mb-4">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </div>
              <h2 className="text-lg font-bold text-center text-[var(--bolt-text-primary)]">{profile.name || "Unknown Lead"}</h2>

              <div className="w-full space-y-4 text-sm mt-6">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Lead Stage</span>
                  <div className="relative group">
                    <select
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg border text-[13px] font-semibold outline-none cursor-pointer appearance-none pr-8 transition-colors",
                        getBadgeColor(profile.stageName || ""),
                        "border-current/20 hover:border-current/40"
                      )}
                      value={profile.stageName || ""}
                      onChange={(e) => handleStageChange(e.target.value)}
                      disabled={stageChangeMutation.isPending}
                    >
                      {!profile.stageName && <option value="" className="surface-3">— Not Set —</option>}
                      {profile.stageName && !stages.some(s => s.stageName === profile.stageName) && (
                        <option value={profile.stageName} className="surface-3">{profile.stageName}</option>
                      )}
                      {stages.map(s => (
                        <option key={s.uuid} value={s.stageName} className="surface-3">{s.stageName}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity" />
                    {stageChangeMutation.isPending && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-0.5">
                        <Loader2 size={14} className="animate-spin text-[var(--bolt-accent)]" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Sub Stage</span>
                  <div className="relative group">
                    <select
                      className={cn(
                        "w-full px-4 py-2.5 rounded-lg border text-[13px] font-semibold outline-none cursor-pointer appearance-none pr-8 transition-colors",
                        subStages.length === 0 ? "surface-3 border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]" : getBadgeColor(profile.subStageName || ""),
                        subStages.length > 0 && "border-current/20 hover:border-current/40"
                      )}
                      value={profile.subStageName || ""}
                      onChange={(e) => handleSubStageChange(e.target.value)}
                      disabled={stageChangeMutation.isPending || subStages.length === 0}
                    >
                      {!profile.subStageName && <option value="" className="surface-3">— Not Set —</option>}
                      {profile.subStageName && !subStages.some(ss => (ss.subStageName || ss.name) === profile.subStageName) && (
                        <option value={profile.subStageName} className="surface-3">{profile.subStageName}</option>
                      )}
                      {subStages.map(ss => {
                        const label = ss.subStageName || ss.name || (ss as any).stageName || (ss as any).sub_stage_name || "Unknown";
                        return (
                          <option key={ss.uuid} value={label} className="surface-3">{label}</option>
                        );
                      })}
                      {subStages.length === 0 && !profile.subStageName && <option value="" className="surface-3">No sub-stages</option>}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity" />
                    {stageChangeMutation.isPending && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/30 rounded-full p-0.5">
                        <Loader2 size={14} className="animate-spin text-[var(--bolt-accent)]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full mt-6 text-xs text-center text-[var(--bolt-text-secondary)] surface-3 py-2 rounded-lg flex items-center justify-center border border-[var(--bolt-border-color)]">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                Last Activity: {formatDate(profile.lastActivity)}
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div>
                <h3 className="text-xs font-bold text-[var(--bolt-text-primary)] mb-4">Basic Info</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-[11px] text-[var(--bolt-text-secondary)] mb-1 uppercase tracking-wider">Email ID</div>
                    <div className="text-sm font-medium break-all flex items-center gap-2 text-[var(--bolt-text-primary)]">
                      {profile.email || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--bolt-text-secondary)] mb-1 uppercase tracking-wider">Phone Number</div>
                    <div className="text-sm font-medium flex items-center justify-between gap-2 text-[var(--bolt-text-primary)]">
                      <span>{profile.countryCode ? `+${profile.countryCode} ${profile.mobile}` : profile.mobile || "-"}</span>
                      {profile.mobile && (
                        <a 
                          href={`tel:${profile.countryCode ? `+${profile.countryCode}` : ''}${profile.mobile}`}
                          onClick={() => {
                            const name = profile.name || "Unknown Lead";
                            logCallToSupabase(uuid, name, profile.mobile);
                          }}
                          className="p-1.5 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-md transition-colors"
                          title="Call Lead"
                        >
                          <PhoneCall size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--bolt-text-secondary)] mb-1 uppercase tracking-wider">Captured On</div>
                    <div className="text-sm font-medium text-[var(--bolt-text-primary)]">
                      {formatDate(profile.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[var(--bolt-text-secondary)] mb-1 uppercase tracking-wider">Assigned Counsellor</div>
                    <div className="text-sm font-medium text-[var(--bolt-text-primary)]">
                      {profile.counsellor || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN AREA */}
          <div className="flex-1 flex flex-col surface-1 relative h-auto md:h-full md:overflow-hidden">
            <LeadProgress profile={profile} />

            <div className="grid grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-[var(--bolt-border-color)] border-b border-[var(--bolt-border-color)] surface-2">
              {[
                { label: "Communication", value: profile.communicationStatus || "—" },
                { label: "Lead Score", value: profile.leadScore ?? "—" },
                { label: "Application", value: profile.applicationStatus || "—" },
                { label: "Source", value: profile.source || "—" },
                { label: "Medium", value: profile.medium || "—" },
                { label: "Lead Type", value: profile.leadType || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="p-5 flex flex-col gap-1">
                  <div className="text-[10px] font-semibold text-[var(--bolt-text-tertiary)] uppercase tracking-widest">{label}</div>
                  <div className="text-[13px] font-semibold text-[var(--bolt-text-primary)] truncate" title={String(value)}>{String(value)}</div>
                </div>
              ))}
            </div>

            <div className="flex px-6 py-4 border-b border-[var(--bolt-border-color)] overflow-x-auto hide-scrollbar shrink-0">
              <div className="flex p-1 bg-[var(--bolt-bg-depth-3)] rounded-xl border border-[var(--bolt-border-color)] w-max">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDrawerTab(tab.id)}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium transition-all rounded-lg shrink-0",
                      drawerTab === tab.id 
                        ? "bg-[var(--bolt-bg-depth-4)] text-[var(--bolt-text-primary)] shadow-sm border border-white/5" 
                        : "text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)] hover:bg-white/5 border border-transparent"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 md:overflow-y-auto p-4 md:p-6 bg-transparent min-h-[400px] md:min-h-0">
              {drawerTab === "profile" && <ProfileTab uuid={uuid} />}
              {drawerTab === "notes" && <NotesTab uuid={uuid} />}
              {drawerTab === "history" && <HistoryTab uuid={uuid} />}
              {drawerTab === "reminders" && <RemindersTab uuid={uuid} />}
              {drawerTab === "email" && <EmailTab uuid={uuid} />}
              {drawerTab === "whatsapp" && <WhatsAppTab uuid={uuid} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
