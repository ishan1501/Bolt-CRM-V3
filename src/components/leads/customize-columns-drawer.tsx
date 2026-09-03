import { useViewStore } from "@/stores/view-store";
import { X, Lock, LockOpen, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export const AVAILABLE_COLUMNS = [
  { id: "lead_type", label: "Lead Type" },
  { id: "registered_name", label: "Registered Name" },
  { id: "registered_email", label: "Registered Email" },
  { id: "registered_mobile", label: "Registered Mobile" },
  { id: "stage_name", label: "Stage Name" },
  { id: "sub_stage_name", label: "Sub Stage Name" },
  { id: "counsellor_name", label: "Counsellor Name" },
  { id: "created_at", label: "Created At" },
  { id: "is_edit_access_granted", label: "Is Edit Access Granted" },
  { id: "is_payment_done", label: "Is Payment Done" },
  { id: "payment_status", label: "Payment Status" },
  { id: "previous_lead_stage", label: "Previous Lead Stage" },
  { id: "application_stage_name", label: "Application Stage Name" },
  { id: "application_sub_stage_name", label: "Application Sub Stage Name" },
  { id: "previous_counsellor", label: "Previous Counsellor" },
  { id: "reassigned_by", label: "Reassigned By" },
  { id: "school_name", label: "School Name" },
  { id: "form_title", label: "Form Title" },
  { id: "number_of_notes", label: "Number Of Notes" },
  { id: "tags", label: "Tags" },
  { id: "is_enrolled", label: "Is Enrolled" },
  { id: "test_lead", label: "Test Lead" },
  { id: "applicant_name", label: "Applicant Name" },
  { id: "applicant_status", label: "Applicant Status" },
  { id: "video_link", label: "Video Link" },
  { id: "video_link_name", label: "Video Link Name" },
  { id: "resume_url", label: "Resume URL" },
  { id: "lead_stage", label: "Lead Stage" },
  { id: "video_status", label: "Video Status" },
  { id: "applicant_status_changed_at", label: "Applicant Status Changed At" },
  { id: "lead_sub_stage", label: "Lead Sub Stage" },
  { id: "video_status_changed_at", label: "Video Status Changed At" },
  { id: "video_reject_reason", label: "Video Reject Reason" },
  { id: "test_decision", label: "Test Decision" },
  { id: "interview_decision", label: "Interview Decision" },
  { id: "country_code", label: "Country Code" },
  { id: "status", label: "Status" },
  { id: "lead_score", label: "Lead Score" },
  { id: "is_mobile_verified", label: "Is Mobile Verified" },
  { id: "is_email_verified", label: "Is Email Verified" },
  { id: "alternate_email", label: "Alternate Email" },
  { id: "alternate_mobile_number", label: "Alternate Mobile Number" },
  { id: "source", label: "Source" },
  { id: "medium", label: "Medium" },
  { id: "campaign", label: "Campaign" },
  { id: "platform", label: "Platform" },
  { id: "lead_origin", label: "Lead Origin" },
  { id: "lead_device", label: "Lead Device" },
  { id: "registered_device", label: "Registered Device" },
  { id: "is_organic", label: "Is Organic" },
  { id: "gclid", label: "Gclid" },
  { id: "fbclid", label: "Fbclid" },
  { id: "fb_lead_id", label: "FB Lead ID" },
  { id: "utm_term", label: "UTM Term" },
  { id: "utm_content", label: "UTM Content" },
  { id: "utm_campaign_id", label: "UTM Campaign ID" },
  { id: "utm_ad_group_id", label: "UTM Ad Group ID" },
  { id: "payment_mode", label: "Payment Mode" },
  { id: "total_amount", label: "Total Amount" },
  { id: "payment_initiated", label: "Payment Initiated" },
  { id: "payment_completed_at", label: "Payment Completed At" },
  { id: "payment_failure_reason", label: "Payment Failure Reason" },
  { id: "payment_first_initiated_at", label: "Payment First Initiated At" },
  { id: "payment_last_initiated_at", label: "Payment Last Initiated At" },
  { id: "payment_method", label: "Payment Method" },
  { id: "payment_partner", label: "Payment Partner" },
  { id: "utr_number", label: "Utr Number" },
  { id: "payment_proof_url", label: "Payment Proof URL" },
  { id: "form_percentage_filled", label: "Form Percentage Filled" },
  { id: "secondary_source", label: "Secondary Source" },
  { id: "secondary_medium", label: "Secondary Medium" },
  { id: "secondary_campaign", label: "Secondary Campaign" },
  { id: "tertiary_source", label: "Tertiary Source" },
  { id: "tertiary_medium", label: "Tertiary Medium" },
  { id: "tertiary_campaign", label: "Tertiary Campaign" },
  { id: "registered_on", label: "Registered On" },
  { id: "city", label: "City" },
  { id: "state", label: "State" },
  { id: "iso_code", label: "Iso Code" },
  { id: "lead_country", label: "Lead Country" },
  { id: "grade", label: "Grade" },
  { id: "widget_id", label: "Widget ID" },
  { id: "utm_placement", label: "UTM Placement" },
  { id: "utm_creative_id", label: "UTM Creative ID" },
  { id: "program_eligible", label: "Program Eligible" },
  { id: "lead_stage_date", label: "Lead Stage Date" },
  { id: "application_stage_date", label: "Application Stage Date" },
  { id: "reassigned_on", label: "Reassigned On" },
  { id: "form_name", label: "Form Name" },
  { id: "referrer", label: "Referrer" },
  { id: "source_url", label: "Source URL" },
  { id: "insta_handle", label: "Insta Handle" },
  { id: "crisp_chat_link", label: "Crisp Chat Link" },
  { id: "cbb_link", label: "Cbb Link" },
  { id: "is_chatbot_lead", label: "Is Chatbot Lead" },
  { id: "concat_smc", label: "Concat Smc" },
  { id: "chat_summary", label: "Chat Summary" },
  { id: "human_handoff", label: "Human Handoff" },
  { id: "form_completion_date", label: "Form Completion Date" },
  { id: "application_form_initiated", label: "Application Form Initiated" },
  { id: "application_form_submitted", label: "Application Form Submitted" },
  { id: "edit_access_granted_at", label: "Edit Access Granted At" },
  { id: "edit_access_granted_by", label: "Edit Access Granted By" },
  { id: "application_number", label: "Application Number" },
  { id: "final_decision", label: "Final Decision" },
  { id: "offer_letter_sent_at", label: "Offer Letter Sent At" },
  { id: "v1_lead_id", label: "V1 Lead ID" },
  { id: "v1_application_id", label: "V1 Application ID" },
  { id: "v1_user_id", label: "V1 User ID" },
  { id: "is_inbound_lead", label: "Is Inbound Lead" },
  { id: "application_registered_on", label: "Application Registered On" },
  { id: "last_interacted_section", label: "Last Interacted Section" },
  { id: "timezone", label: "Timezone" },
  { id: "counsellor", label: "Counsellor" },
  { id: "application_stage", label: "Application Stage" },
  { id: "application_sub_stage", label: "Application Sub Stage" },
  { id: "school", label: "School" },
  { id: "activity_tracker", label: "Activity Tracker" },
  { id: "counsellor_last_activity_date", label: "Counsellor Last Activity Date" },
  { id: "application_form_start_date", label: "Application Form Start Date" },
  { id: "payment_initiated_date", label: "Payment Initiated Date" },
  { id: "payment_last_initiated_date", label: "Payment Last Initiated Date" },
  { id: "counsellor_first_activity_date", label: "Counsellor First Activity Date" },
  { id: "application_fee_paid_on", label: "Application Fee Paid On" },
  { id: "application_last_activity_date", label: "Application Last Activity Date" },
  { id: "last_lead_stage_updated", label: "Last Lead Stage Updated" },
  { id: "first_lead_stage_updated", label: "First Lead Stage Updated" },
  { id: "application_form_submitted_on", label: "Application Form Submitted On" },
  { id: "notes", label: "Notes" },
  { id: "no_of_notes", label: "No Of Notes" },
  { id: "perspect_ai_invitation_id", label: "Perspect AI Invitation ID" },
  { id: "perspect_ai_exam_result", label: "Perspect AI Exam Result" },
  { id: "perspect_ai_magic_link", label: "Perspect AI Magic Link" },
  { id: "perspect_ai_enable_test", label: "Perspect AI Enable Test" },
];

export function CustomizeColumnsDrawer() {
  const { isCustomizeColumnsOpen, setCustomizeColumnsOpen, views, activeViewId, updateActiveViewColumns, toggleLockedColumn } = useViewStore();
  const activeView = views.find(v => v.id === activeViewId);
  const [localColumns, setLocalColumns] = useState<string[]>([]);
  const lockedColumns: string[] = activeView?.lockedColumns || [];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (activeView) {
      setLocalColumns(activeView.columns);
    }
  }, [activeView, isCustomizeColumnsOpen]);

  if (!mounted || !isCustomizeColumnsOpen) return null;

  const toggleColumn = (id: string) => {
    setLocalColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    updateActiveViewColumns(localColumns);
    setCustomizeColumnsOpen(false);
  };

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in"
        onClick={() => setCustomizeColumnsOpen(false)}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[600px] surface-1 z-[101] shadow-2xl flex flex-col border-l border-[var(--bolt-border-color)] animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-[var(--bolt-border-color)] flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-[var(--bolt-text-primary)]">Customize Columns</h2>
          <button 
            onClick={() => setCustomizeColumnsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bolt-hover-overlay-md)] transition-colors"
          >
            <X size={18} className="text-[var(--bolt-text-secondary)]" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Side: Available Fields */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-[var(--bolt-border-color)] flex flex-col">
            <div className="p-4 border-b border-[var(--bolt-border-color)] surface-2 font-medium text-sm text-[var(--bolt-text-primary)] shrink-0">
              Available Fields
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {AVAILABLE_COLUMNS.map(col => {
                const isActive = localColumns.includes(col.id);
                return (
                  <label key={col.id} className="flex items-center gap-3 p-2 hover:surface-2 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-[var(--bolt-border-color)] bg-transparent text-[var(--bolt-accent)] focus:ring-[var(--bolt-accent-glow)] shrink-0"
                      checked={isActive}
                      onChange={() => toggleColumn(col.id)}
                    />
                    <span className="text-sm text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)] truncate">{col.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Right Side: Active Columns */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col surface-1">
            <div className="p-4 border-b border-[var(--bolt-border-color)] font-medium text-sm text-[var(--bolt-text-secondary)] shrink-0">
              Active Columns ({localColumns.length}/20)
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {localColumns.map((colId) => {
                const col = AVAILABLE_COLUMNS.find(c => c.id === colId);
                if (!col) return null;
                const isColLocked = lockedColumns.includes(col.id);
                return (
                  <div
                    key={col.id}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg shadow-sm transition-all duration-150",
                      isColLocked
                        ? "bg-[var(--bolt-accent-glow)] border-[var(--bolt-accent)]"
                        : "surface-2 border-[var(--bolt-border-color)]"
                    )}
                  >
                    <span title="Drag to reorder (coming soon)"><GripVertical size={14} className="text-[var(--bolt-text-tertiary)] shrink-0 opacity-40" /></span>
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span className="text-sm text-[var(--bolt-text-primary)] truncate">{col.label}</span>
                      {isColLocked && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--bolt-accent)] shrink-0">Pinned</span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleLockedColumn(col.id)}
                      className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150 shrink-0",
                        isColLocked
                          ? "text-[var(--bolt-text-primary)] hover:bg-[var(--bolt-hover-overlay-md)]"
                          : "text-[var(--bolt-text-tertiary)] hover:text-[var(--bolt-accent)] hover:bg-[var(--bolt-hover-overlay)]"
                      )}
                      title={isColLocked ? "Unpin column" : "Pin column (sticky while scrolling)"}
                    >
                      {isColLocked ? <Lock size={13} /> : <LockOpen size={13} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--bolt-border-color)] flex items-center justify-between surface-2">
          <button 
            onClick={() => setLocalColumns(activeView?.columns || [])}
            className="px-4 py-2 text-sm font-medium text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]"
          >
            Reset
          </button>
          <button 
            onClick={handleApply}
            className="px-6 py-2 bg-[var(--bolt-accent)] hover:bg-[var(--bolt-accent-hover)] text-black font-semibold text-sm rounded-lg shadow-[0_0_12px_var(--bolt-accent-glow)] transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
