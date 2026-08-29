"use client";

import { useSavedLeadsStore } from "@/stores/saved-leads-store";
import { GlassCard } from "@/components/ui/glass-card";
import { Bookmark, Phone, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";
import { Lead } from "@/types/crm";
import { useRouter } from "next/navigation";

export default function SavedLeadsPage() {
  const { savedLeads, removeLead, fetchLeads } = useSavedLeadsStore();
  const router = useRouter();

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Map saved leads to the minimal Lead shape so the drawer can do prev/next
  const leadsForDrawer = savedLeads.map(l => ({
    uuid: l.uuid,
    registered_name: l.name,
    registered_email: l.email,
    registered_mobile: l.mobile,
    stage_name: l.stageName,
  } as unknown as Lead));

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[var(--bolt-bg-depth-2)] flex items-center justify-center shadow-sm border border-[var(--bolt-border-color)]">
          <Bookmark size={24} className="text-[var(--bolt-accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--bolt-text-primary)]">Saved Leads</h1>
          <p className="text-sm text-[var(--bolt-text-secondary)]">You have {savedLeads.length} saved leads for quick access.</p>
        </div>
      </div>

      {savedLeads.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center p-16 text-center border-dashed">
          <Bookmark size={48} className="text-[var(--bolt-text-tertiary)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--bolt-text-primary)]">No saved leads yet</h3>
          <p className="text-[var(--bolt-text-secondary)] mt-2 max-w-md">
            Click the save icon on any lead profile to bookmark them here for easy follow-up.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedLeads.map((lead) => (
            <GlassCard key={lead.uuid} className="p-5 flex flex-col relative group transition-all hover:shadow-lg border border-[var(--bolt-border-color)] hover:border-[var(--bolt-accent)]/50">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  removeLead(lead.uuid, lead.dbId);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[var(--bolt-text-secondary)] opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Remove saved lead"
              >
                <Bookmark size={14} className="fill-current text-[var(--bolt-accent)] hover:text-rose-400" />
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--bolt-accent)] to-[#fde047] flex items-center justify-center text-black font-bold text-lg shadow-sm shrink-0">
                  {(lead.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <button
                    onClick={() => router.push(`/leads/${lead.uuid}`)}
                    className="font-semibold text-[var(--bolt-text-primary)] hover:text-[var(--bolt-accent)] transition-colors line-clamp-1 text-left w-full"
                  >
                    {lead.name || "Unknown Lead"}
                  </button>
                  <div className="text-xs text-[var(--bolt-text-tertiary)] mt-0.5">
                    Saved {formatDistanceToNow(lead.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-2">
                {lead.email && (
                  <div className="flex items-center gap-2 text-sm text-[var(--bolt-text-secondary)]">
                    <Mail size={14} className="text-[var(--bolt-text-tertiary)] shrink-0" />
                    <span className="line-clamp-1">{lead.email}</span>
                  </div>
                )}
                {lead.mobile && (
                  <div className="flex items-center gap-2 text-sm text-[var(--bolt-text-secondary)]">
                    <Phone size={14} className="text-[var(--bolt-text-tertiary)] shrink-0" />
                    <span>{lead.mobile}</span>
                  </div>
                )}
                {lead.note && (
                  <div className="text-xs text-[var(--bolt-text-tertiary)] italic mt-1 border-l-2 border-[var(--bolt-accent)]/40 pl-2">
                    {lead.note}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--bolt-border-color)] flex items-center justify-between">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-white/5 text-[var(--bolt-text-secondary)]">
                  {lead.stageName || "Unknown"}
                </span>
                <button
                  onClick={() => router.push(`/leads/${lead.uuid}`)}
                  className="text-xs font-semibold text-[var(--bolt-accent)] hover:text-white transition-colors"
                >
                  View Profile →
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

    </div>
  );
}
