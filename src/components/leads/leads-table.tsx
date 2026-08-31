import { Lead } from "@/types/crm";
import { useUIStore } from "@/stores/ui-store";
import { useViewStore } from "@/stores/view-store";
import { AVAILABLE_COLUMNS } from "./customize-columns-drawer";
import { format } from "date-fns";
import { cn, getBadgeColor } from "@/lib/utils";
import { Lock, LockOpen, PhoneCall } from "lucide-react";
import { useEffect, useRef } from "react";
import { logCallToSupabase } from "@/lib/log-call";
import { useRouter } from "next/navigation";

interface LeadsTableProps {
  leads: Lead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const { selectedLeadIds, toggleLeadSelection, clearSelection, openDrawer } = useUIStore();
  const { views, activeViewId, toggleLockedColumn } = useViewStore();
  const router = useRouter();

  const activeView = views.find(v => v.id === activeViewId) || views[0];
  const activeColumns = activeView.columns.map(id => AVAILABLE_COLUMNS.find(c => c.id === id)!).filter(Boolean);
  const lockedColumns: string[] = activeView.lockedColumns || [];

  // Approximate column widths for sticky offset calculation
  const COL_WIDTHS: Record<string, number> = {
    lead_type: 110, registered_name: 170, registered_email: 210,
    registered_mobile: 170, form_title: 200, stage_name: 150,
    sub_stage_name: 150, counsellor_name: 160, created_at: 180,
    school_name: 160, is_edit_access_granted: 90, is_payment_done: 90,
    payment_status: 120, previous_lead_stage: 140, application_stage_name: 160,
    application_sub_stage_name: 170, previous_counsellor: 160, reassigned_by: 140,
    form_uuid: 130, number_of_notes: 80, tags: 140,
  };
  const CHECKBOX_WIDTH = 56;

  // Compute left offset for each locked column based on previous locked columns
  const getStickyLeft = (colId: string): number => {
    let offset = CHECKBOX_WIDTH;
    for (const col of activeColumns) {
      if (col.id === colId) break;
      if (lockedColumns.includes(col.id)) {
        offset += COL_WIDTHS[col.id] ?? 140;
      }
    }
    return offset;
  };

  const isLocked = (colId: string) => lockedColumns.includes(colId);


  const renderCell = (lead: Lead, colId: string) => {
    switch(colId) {
      case "lead_type": return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--bolt-bg-depth-3)] text-[var(--bolt-text-secondary)] border border-[var(--bolt-border-color)]">
          {lead.lead_type || "Primary"}
        </span>
      );
      case "registered_name": return (
        <div className="font-medium text-sm text-[var(--bolt-text-primary)] hover:underline cursor-pointer truncate max-w-[150px]">
          {lead.registered_name || "Unknown"}
        </div>
      );
      case "registered_email": return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[180px]">{lead.registered_email || "-"}</div>;
      case "registered_mobile": return <div className="text-sm text-[var(--bolt-text-secondary)]">{lead.registered_mobile || "-"}</div>;
      case "stage_name": return (
        <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(lead.stage_name || (lead as any).stageName || "Unknown"))} title={lead.stage_name || (lead as any).stageName || "Unknown"}>
          {lead.stage_name || (lead as any).stageName || "Unknown"}
        </span>
      );
      case "sub_stage_name": return (
        <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(lead.sub_stage_name || (lead as any).subStageName || "NA"))} title={lead.sub_stage_name || (lead as any).subStageName || "NA"}>
          {lead.sub_stage_name || (lead as any).subStageName || "NA"}
        </span>
      );
      case "counsellor_name": return <div className="text-sm text-[var(--bolt-text-secondary)]">{(lead as any).counsellorName || lead.counsellor_name || "-"}</div>;
      case "created_at": return <div className="text-sm text-[var(--bolt-text-secondary)]">{lead.created_at || (lead as any).createdAt || (lead as any).capturedOn ? format(new Date(lead.created_at || (lead as any).createdAt || (lead as any).capturedOn), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      case "is_edit_access_granted": return <div className="text-sm text-[var(--bolt-text-secondary)]">{(lead as any).isEditAccessGranted || lead.is_edit_access_granted ? "Yes" : "No"}</div>;
      case "is_payment_done": return <div className="text-sm text-[var(--bolt-text-secondary)]">{(lead as any).isPaymentDone || lead.is_payment_done ? "Yes" : "No"}</div>;
      case "payment_status": return <div className="text-sm text-[var(--bolt-text-secondary)]">{(lead as any).paymentStatus || lead.payment_status || "-"}</div>;
      case "previous_lead_stage": return <div className="text-sm text-[var(--bolt-text-secondary)]">{(lead as any).previousLeadStage || lead.previous_lead_stage || "-"}</div>;
      case "application_stage_name": return (
        <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor((lead as any).applicationStageName || lead.application_stage_name || "-"))} title={(lead as any).applicationStageName || lead.application_stage_name || "-"}>
          {(lead as any).applicationStageName || lead.application_stage_name || "-"}
        </span>
      );
      case "application_sub_stage_name": return (
        <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor((lead as any).applicationSubStageName || lead.application_sub_stage_name || "-"))} title={(lead as any).applicationSubStageName || lead.application_sub_stage_name || "-"}>
          {(lead as any).applicationSubStageName || lead.application_sub_stage_name || "-"}
        </span>
      );
      case "previous_counsellor": return <div className="text-sm text-[var(--bolt-text-secondary)]">{(lead as any).previousCounsellor || lead.previous_counsellor || "-"}</div>;
      case "reassigned_by": return <div className="text-sm text-[var(--bolt-text-secondary)]">{(lead as any).reassignedBy || lead.reassigned_by || "-"}</div>;
      case "school_name": return <div className="text-sm text-[var(--bolt-text-secondary)]">{(lead as any).schoolName || lead.school_name || (lead as any).schoolData?.name || "-"}</div>;
      case "form_title": return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]" title={lead.form_title || (lead as any).formTitle || "-"}>{lead.form_title || (lead as any).formTitle || "-"}</div>;
      case "number_of_notes": return <div className="text-sm text-[var(--bolt-text-secondary)]">{lead.number_of_notes || (lead as any).numberOfNotes || (lead as any).notesCount || 0}</div>;
      case "tags": return <div className="text-sm text-[var(--bolt-text-secondary)]">{lead.tags && lead.tags.length > 0 ? lead.tags.join(", ") : "-"}</div>;
      default: return null;
    }
  };

  return (
    <div className="w-full h-full overflow-auto">
      
      {/* Desktop Table View */}
      <table className="hidden md:table w-full min-w-max text-left text-sm whitespace-nowrap border-separate border-spacing-0">
          <thead className="text-[11px] font-bold text-[var(--bolt-text-secondary)] uppercase tracking-wider">
            <tr>
              {/* Checkbox column — always frozen at left:0 */}
              <th
                className={cn(
                  "sticky left-0 top-0 z-30 px-4 py-3 text-left w-[56px] min-w-[56px] max-w-[56px] bg-[var(--bolt-bg-depth-2)] border-b border-[var(--bolt-border-color)]",
                  lockedColumns.length === 0 && "border-r shadow-[2px_0_6px_-2px_rgba(0,0,0,0.25)]"
                )}
              >
              </th>
              {activeColumns.map((col, index) => {
                const locked = isLocked(col.id);
                const isLastLocked = locked && lockedColumns.length > 0 && col.id === lockedColumns[lockedColumns.length - 1];
                const isLastActive = index === activeColumns.length - 1;
                const stickyLeft = locked ? getStickyLeft(col.id) : undefined;
                const width = COL_WIDTHS[col.id] ?? 140;
                
                return (
                  <th
                    key={col.id}
                    className={cn(
                      "px-4 py-3 text-left border-b border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-2)]",
                      locked ? "sticky top-0 z-20" : "top-0 sticky z-[5]",
                      isLastLocked && "border-r shadow-[2px_0_6px_-2px_rgba(0,0,0,0.25)]"
                    )}
                    style={{ ...(locked ? { left: stickyLeft } : {}), width, minWidth: width, maxWidth: isLastActive ? undefined : width }}
                  >
                    <div className="flex items-center gap-1.5 group/header">
                      <button 
                        onClick={() => toggleLockedColumn(col.id)}
                        className={cn(
                          "shrink-0 transition-opacity p-0.5 rounded flex items-center justify-center",
                          locked 
                            ? "opacity-100 text-[var(--bolt-accent)]" 
                            : "opacity-0 group-hover/header:opacity-100 text-[var(--bolt-text-tertiary)] hover:text-[var(--bolt-text-primary)] hover:bg-white/5"
                        )}
                        title={locked ? "Unfreeze up to here" : "Freeze up to here"}
                      >
                        {locked ? <Lock size={12} /> : <LockOpen size={12} />}
                      </button>
                      <span>{col.label}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length + 1} className="px-4 py-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] flex items-center justify-center mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--bolt-text-secondary)]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--bolt-text-primary)]">No leads found</h3>
                    <p className="text-sm text-[var(--bolt-text-secondary)]">Try adjusting your filters or search query to find what you're looking for.</p>
                  </div>
                </td>
              </tr>
            ) : leads.map((lead) => {
              const isSelected = selectedLeadIds.has(lead.uuid);
              const isUntouched = (lead.stage_name || (lead as any).stageName)?.toLowerCase() === "untouched";
              
              // Precompute row bg color strings for sticky cells (cannot use group-hover utility on custom classes)
              const rowBg = isSelected ? "var(--bolt-accent-glow)" : 
                          isUntouched ? "var(--bolt-untouched-bg)" : 
                          "var(--bolt-bg-depth-2)";
              const rowBgHover = isSelected ? "var(--bolt-accent-glow)" : 
                               isUntouched ? "var(--bolt-untouched-bg-hover)" : 
                               "var(--bolt-bg-depth-3)";
                               
              return (
                <tr
                  key={lead.uuid}
                  onClick={() => router.push(`/leads/${lead.uuid}`)}
                  className={cn(
                    "group/row cursor-pointer transition-colors whitespace-nowrap",
                    isSelected ? "bg-[var(--bolt-accent-glow)]" : 
                    isUntouched ? "bg-[var(--bolt-untouched-bg)] hover:bg-[var(--bolt-untouched-bg-hover)]" : 
                    "hover:bg-[var(--bolt-bg-depth-3)]/50"
                  )}
                >
                  {/* Checkbox cell — always frozen */}
                  <td
                    className={cn(
                      "sticky left-0 z-[11] px-4 py-3 border-b border-[var(--bolt-border-color)] w-[56px] min-w-[56px] max-w-[56px]",
                      lockedColumns.length === 0 && "border-r shadow-[2px_0_6px_-2px_rgba(0,0,0,0.2)]"
                    )}
                    style={{ backgroundColor: rowBg }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = rowBgHover; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = rowBg; }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="rounded border-[var(--bolt-border-color)] bg-transparent text-[var(--bolt-accent)] focus:ring-[var(--bolt-accent-glow)]"
                      checked={isSelected}
                      onChange={() => toggleLeadSelection(lead.uuid)}
                    />
                  </td>
                  {activeColumns.map((col, index) => {
                    const locked = isLocked(col.id);
                    const isLastLocked = locked && lockedColumns.length > 0 && col.id === lockedColumns[lockedColumns.length - 1];
                    const isLastActive = index === activeColumns.length - 1;
                    const stickyLeft = locked ? getStickyLeft(col.id) : undefined;
                    const width = COL_WIDTHS[col.id] ?? 140;
                    
                    return (
                      <td
                        key={col.id}
                        className={cn(
                          "px-4 py-3 border-b border-[var(--bolt-border-color)]",
                          locked && "sticky z-[10]",
                          isLastLocked && "border-r shadow-[2px_0_6px_-2px_rgba(0,0,0,0.2)]"
                        )}
                        style={{ ...(locked ? { left: stickyLeft, backgroundColor: rowBg } : {}), width, minWidth: width, maxWidth: isLastActive ? undefined : width }}
                        onMouseEnter={locked ? e => { (e.currentTarget as HTMLElement).style.backgroundColor = rowBgHover; } : undefined}
                        onMouseLeave={locked ? e => { (e.currentTarget as HTMLElement).style.backgroundColor = rowBg; } : undefined}
                      >
                        {renderCell(lead, col.id)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col divide-y divide-[var(--bolt-border-color)]">
        {leads.map((lead) => {
          const isSelected = selectedLeadIds.has(lead.uuid);
          const isUntouched = (lead.stage_name || (lead as any).stageName)?.toLowerCase() === "untouched";
          
          return (
            <div 
              key={lead.uuid}
              onClick={() => router.push(`/leads/${lead.uuid}`)}
              className={cn(
                "p-4 flex gap-3 transition-colors cursor-pointer",
                isSelected ? "bg-[var(--bolt-accent-glow)]" : 
                isUntouched ? "bg-[var(--bolt-untouched-bg)] active:bg-[var(--bolt-untouched-bg-hover)]" : 
                "bg-[var(--bolt-bg-depth-1)] active:bg-[var(--bolt-bg-depth-2)]"
              )}
            >
              <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                <input
                  type="checkbox"
                  className="rounded border-[var(--bolt-border-color)] bg-transparent text-[var(--bolt-accent)] focus:ring-[var(--bolt-accent-glow)]"
                  checked={isSelected}
                  onChange={() => toggleLeadSelection(lead.uuid)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <h3 className="font-semibold text-[15px] text-[var(--bolt-text-primary)] truncate">
                    {lead.registered_name || "Unknown"}
                  </h3>
                  <span className={cn("shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-medium border", getBadgeColor(lead.stage_name || (lead as any).stageName || "Unknown"))}>
                    {lead.stage_name || (lead as any).stageName || "Unknown"}
                  </span>
                </div>
                <div className="text-[13px] font-medium text-[var(--bolt-text-secondary)] truncate mb-2">
                  {lead.form_title || (lead as any).formTitle || "—"}
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--bolt-text-tertiary)]">
                  <span className="truncate max-w-[140px]">{lead.registered_email || "—"}</span>
                  <span>{lead.registered_mobile || "—"}</span>
                </div>
              </div>
              
              {lead.registered_mobile && (
                <div className="flex items-center justify-center shrink-0 pl-1">
                  <a 
                    href={`tel:${lead.registered_mobile}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const name = lead.registered_name || "Unknown Lead";
                      logCallToSupabase(lead.uuid, name, lead.registered_mobile || (lead as any).mobile);
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-green-500/10 text-green-600 border border-green-500/20 rounded-full transition-colors active:bg-green-500/20"
                    title="Call"
                  >
                    <PhoneCall size={18} />
                  </a>
                </div>
              )}
            </div>
          );
        })}
        {leads.length === 0 && (
          <div className="p-8 text-center text-sm text-[var(--bolt-text-secondary)]">
            No leads found.
          </div>
        )}
      </div>

    </div>
  );
}

