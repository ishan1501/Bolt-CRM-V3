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

export function LeadsTable({ leads }: LeadsTableProps) { if (leads && leads.length > 0) { console.log("LEAD_DUMP:", JSON.stringify(leads[0])); }
  const { selectedLeadIds, toggleLeadSelection, clearSelection, openDrawer } = useUIStore();
  const { views, activeViewId, toggleLockedColumn } = useViewStore();
  const router = useRouter();

  const activeView = views.find(v => v.id === activeViewId) || views[0];
  const activeColumns = activeView.columns.map(id => AVAILABLE_COLUMNS.find(c => c.id === id)!).filter(Boolean);
  const lockedColumns: string[] = activeView.lockedColumns || [];

  // Approximate column widths for sticky offset calculation
    const COL_WIDTHS: Record<string, number> = {
  "lead_type": 110,
  "registered_name": 180,
  "registered_email": 220,
  "registered_mobile": 170,
  "form_title": 200,
  "stage_name": 180,
  "sub_stage_name": 180,
  "counsellor_name": 180,
  "created_at": 260,
  "school_name": 180,
  "is_edit_access_granted": 90,
  "is_payment_done": 260,
  "payment_status": 260,
  "previous_lead_stage": 140,
  "application_stage_name": 260,
  "application_sub_stage_name": 260,
  "previous_counsellor": 160,
  "reassigned_by": 140,
  "form_uuid": 130,
  "number_of_notes": 80,
  "tags": 140,
  "is_enrolled": 150,
  "test_lead": 150,
  "applicant_name": 180,
  "applicant_status": 260,
  "video_link": 150,
  "video_link_name": 180,
  "resume_url": 150,
  "lead_stage": 150,
  "video_status": 260,
  "applicant_status_changed_at": 260,
  "lead_sub_stage": 150,
  "video_status_changed_at": 260,
  "video_reject_reason": 260,
  "test_decision": 260,
  "interview_decision": 260,
  "country_code": 150,
  "status": 260,
  "lead_score": 150,
  "is_mobile_verified": 150,
  "is_email_verified": 150,
  "alternate_email": 260,
  "alternate_mobile_number": 260,
  "source": 150,
  "medium": 150,
  "campaign": 150,
  "platform": 260,
  "lead_origin": 150,
  "lead_device": 150,
  "registered_device": 150,
  "is_organic": 150,
  "gclid": 150,
  "fbclid": 150,
  "fb_lead_id": 150,
  "utm_term": 150,
  "utm_content": 260,
  "utm_campaign_id": 150,
  "utm_ad_group_id": 150,
  "payment_mode": 150,
  "total_amount": 150,
  "payment_initiated": 260,
  "payment_completed_at": 260,
  "payment_failure_reason": 260,
  "payment_first_initiated_at": 260,
  "payment_last_initiated_at": 260,
  "payment_method": 150,
  "payment_partner": 150,
  "utr_number": 150,
  "payment_proof_url": 150,
  "form_percentage_filled": 150,
  "secondary_source": 260,
  "secondary_medium": 260,
  "secondary_campaign": 260,
  "tertiary_source": 150,
  "tertiary_medium": 150,
  "tertiary_campaign": 150,
  "registered_on": 260,
  "city": 150,
  "state": 260,
  "iso_code": 150,
  "lead_country": 150,
  "grade": 150,
  "widget_id": 150,
  "utm_placement": 150,
  "utm_creative_id": 260,
  "program_eligible": 150,
  "lead_stage_date": 260,
  "application_stage_date": 260,
  "reassigned_on": 260,
  "form_name": 180,
  "referrer": 150,
  "source_url": 150,
  "insta_handle": 150,
  "crisp_chat_link": 260,
  "cbb_link": 150,
  "is_chatbot_lead": 260,
  "concat_smc": 260,
  "chat_summary": 260,
  "human_handoff": 150,
  "form_completion_date": 260,
  "application_form_initiated": 260,
  "application_form_submitted": 260,
  "edit_access_granted_at": 260,
  "edit_access_granted_by": 150,
  "application_number": 260,
  "final_decision": 260,
  "offer_letter_sent_at": 260,
  "v1_lead_id": 150,
  "v1_application_id": 260,
  "v1_user_id": 150,
  "is_inbound_lead": 150,
  "application_registered_on": 260,
  "last_interacted_section": 260,
  "timezone": 260,
  "counsellor": 150,
  "application_stage": 260,
  "application_sub_stage": 260,
  "school": 150,
  "activity_tracker": 150,
  "counsellor_last_activity_date": 260,
  "application_form_start_date": 260,
  "payment_initiated_date": 260,
  "payment_last_initiated_date": 260,
  "counsellor_first_activity_date": 260,
  "application_fee_paid_on": 260,
  "application_last_activity_date": 260,
  "last_lead_stage_updated": 260,
  "first_lead_stage_updated": 260,
  "application_form_submitted_on": 260,
  "notes": 150,
  "no_of_notes": 150,
  "perspect_ai_invitation_id": 260,
  "perspect_ai_exam_result": 150,
  "perspect_ai_magic_link": 150,
  "perspect_ai_enable_test": 150
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


    const getLeadValue = (lead: any, snakeCase: string, camelCase: string) => {
    if (!lead) return null;
    if (lead[snakeCase] !== undefined && lead[snakeCase] !== null) return lead[snakeCase];
    if (lead[camelCase] !== undefined && lead[camelCase] !== null) return lead[camelCase];
    if (lead.metaData && lead.metaData[camelCase] !== undefined && lead.metaData[camelCase] !== null) return lead.metaData[camelCase];
    if (lead.metaData && lead.metaData[snakeCase] !== undefined && lead.metaData[snakeCase] !== null) return lead.metaData[snakeCase];
    if (lead.lead_data && lead.lead_data[snakeCase] !== undefined && lead.lead_data[snakeCase] !== null) return lead.lead_data[snakeCase];
    if (lead.personal_info && lead.personal_info[snakeCase] !== undefined && lead.personal_info[snakeCase] !== null) return lead.personal_info[snakeCase];
    if (lead.schoolData && lead.schoolData[camelCase] !== undefined && lead.schoolData[camelCase] !== null) return lead.schoolData[camelCase];
    if (lead.schoolData && lead.schoolData[snakeCase] !== undefined && lead.schoolData[snakeCase] !== null) return lead.schoolData[snakeCase];
    return null;
  };

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
      case "is_enrolled": {
        const val = getLeadValue(lead, "is_enrolled", "isEnrolled");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "test_lead": {
        const val = getLeadValue(lead, "test_lead", "testLead");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "applicant_name": {
        const val = getLeadValue(lead, "applicant_name", "applicantName");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "applicant_status": {
        const st = getLeadValue(lead, "applicant_status", "applicantStatus");
        return <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(st || "Unknown"))} title={st || "Unknown"}>{st || "Unknown"}</span>;
      }
      case "video_link": {
        const url = getLeadValue(lead, "video_link", "videoLink");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{url ? <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline" onClick={e => e.stopPropagation()}>Link</a> : "-"}</div>;
      }
      case "video_link_name": {
        const url = getLeadValue(lead, "video_link_name", "videoLinkName");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{url ? <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline" onClick={e => e.stopPropagation()}>Link</a> : "-"}</div>;
      }
      case "resume_url": {
        const url = getLeadValue(lead, "resume_url", "resumeUrl");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{url ? <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline" onClick={e => e.stopPropagation()}>Link</a> : "-"}</div>;
      }
      case "lead_stage": {
        const st = getLeadValue(lead, "lead_stage", "leadStage");
        return <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(st || "Unknown"))} title={st || "Unknown"}>{st || "Unknown"}</span>;
      }
      case "video_status": {
        const st = getLeadValue(lead, "video_status", "videoStatus");
        return <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(st || "Unknown"))} title={st || "Unknown"}>{st || "Unknown"}</span>;
      }
      case "applicant_status_changed_at": {
        const d = getLeadValue(lead, "applicant_status_changed_at", "applicantStatusChangedAt");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "lead_sub_stage": {
        const st = getLeadValue(lead, "lead_sub_stage", "leadSubStage");
        return <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(st || "Unknown"))} title={st || "Unknown"}>{st || "Unknown"}</span>;
      }
      case "video_status_changed_at": {
        const d = getLeadValue(lead, "video_status_changed_at", "videoStatusChangedAt");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "video_reject_reason": {
        const val = getLeadValue(lead, "video_reject_reason", "videoRejectReason");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "test_decision": {
        const st = getLeadValue(lead, "test_decision", "testDecision");
        return <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(st || "Unknown"))} title={st || "Unknown"}>{st || "Unknown"}</span>;
      }
      case "interview_decision": {
        const st = getLeadValue(lead, "interview_decision", "interviewDecision");
        return <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(st || "Unknown"))} title={st || "Unknown"}>{st || "Unknown"}</span>;
      }
      case "country_code": {
        const val = getLeadValue(lead, "country_code", "countryCode");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "status": {
        const st = getLeadValue(lead, "status", "status");
        return <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(st || "Unknown"))} title={st || "Unknown"}>{st || "Unknown"}</span>;
      }
      case "lead_score": {
        const val = getLeadValue(lead, "lead_score", "leadScore");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "is_mobile_verified": {
        const val = getLeadValue(lead, "is_mobile_verified", "isMobileVerified");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "is_email_verified": {
        const val = getLeadValue(lead, "is_email_verified", "isEmailVerified");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "alternate_email": {
        const val = getLeadValue(lead, "alternate_email", "alternateEmail");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "alternate_mobile_number": {
        const val = getLeadValue(lead, "alternate_mobile_number", "alternateMobileNumber");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "source": {
        const val = getLeadValue(lead, "source", "source");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "medium": {
        const val = getLeadValue(lead, "medium", "medium");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "campaign": {
        const val = getLeadValue(lead, "campaign", "campaign");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "platform": {
        const val = getLeadValue(lead, "platform", "platform");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "lead_origin": {
        const val = getLeadValue(lead, "lead_origin", "leadOrigin");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "lead_device": {
        const val = getLeadValue(lead, "lead_device", "leadDevice");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "registered_device": {
        const val = getLeadValue(lead, "registered_device", "registeredDevice");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "is_organic": {
        const val = getLeadValue(lead, "is_organic", "isOrganic");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "gclid": {
        const val = getLeadValue(lead, "gclid", "gclid");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "fbclid": {
        const val = getLeadValue(lead, "fbclid", "fbclid");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "fb_lead_id": {
        const val = getLeadValue(lead, "fb_lead_id", "fbLeadId");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "utm_term": {
        const val = getLeadValue(lead, "utm_term", "utmTerm");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "utm_content": {
        const val = getLeadValue(lead, "utm_content", "utmContent");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "utm_campaign_id": {
        const val = getLeadValue(lead, "utm_campaign_id", "utmCampaignId");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "utm_ad_group_id": {
        const val = getLeadValue(lead, "utm_ad_group_id", "utmAdGroupId");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "payment_mode": {
        const val = getLeadValue(lead, "payment_mode", "paymentMode");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "total_amount": {
        const val = getLeadValue(lead, "total_amount", "totalAmount");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "payment_initiated": {
        const val = getLeadValue(lead, "payment_initiated", "paymentInitiated");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "payment_completed_at": {
        const d = getLeadValue(lead, "payment_completed_at", "paymentCompletedAt");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "payment_failure_reason": {
        const val = getLeadValue(lead, "payment_failure_reason", "paymentFailureReason");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "payment_first_initiated_at": {
        const d = getLeadValue(lead, "payment_first_initiated_at", "paymentFirstInitiatedAt");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "payment_last_initiated_at": {
        const d = getLeadValue(lead, "payment_last_initiated_at", "paymentLastInitiatedAt");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "payment_method": {
        const val = getLeadValue(lead, "payment_method", "paymentMethod");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "payment_partner": {
        const val = getLeadValue(lead, "payment_partner", "paymentPartner");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "utr_number": {
        const val = getLeadValue(lead, "utr_number", "utrNumber");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "payment_proof_url": {
        const url = getLeadValue(lead, "payment_proof_url", "paymentProofUrl");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{url ? <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline" onClick={e => e.stopPropagation()}>Link</a> : "-"}</div>;
      }
      case "form_percentage_filled": {
        const val = getLeadValue(lead, "form_percentage_filled", "formPercentageFilled");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "secondary_source": {
        const val = getLeadValue(lead, "secondary_source", "secondarySource");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "secondary_medium": {
        const val = getLeadValue(lead, "secondary_medium", "secondaryMedium");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "secondary_campaign": {
        const val = getLeadValue(lead, "secondary_campaign", "secondaryCampaign");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "tertiary_source": {
        const val = getLeadValue(lead, "tertiary_source", "tertiarySource");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "tertiary_medium": {
        const val = getLeadValue(lead, "tertiary_medium", "tertiaryMedium");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "tertiary_campaign": {
        const val = getLeadValue(lead, "tertiary_campaign", "tertiaryCampaign");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "registered_on": {
        const d = getLeadValue(lead, "registered_on", "registeredOn");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "city": {
        const val = getLeadValue(lead, "city", "city");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "state": {
        const val = getLeadValue(lead, "state", "state");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "iso_code": {
        const val = getLeadValue(lead, "iso_code", "isoCode");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "lead_country": {
        const val = getLeadValue(lead, "lead_country", "leadCountry");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "grade": {
        const val = getLeadValue(lead, "grade", "grade");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "widget_id": {
        const val = getLeadValue(lead, "widget_id", "widgetId");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "utm_placement": {
        const val = getLeadValue(lead, "utm_placement", "utmPlacement");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "utm_creative_id": {
        const val = getLeadValue(lead, "utm_creative_id", "utmCreativeId");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "program_eligible": {
        const val = getLeadValue(lead, "program_eligible", "programEligible");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "lead_stage_date": {
        const d = getLeadValue(lead, "lead_stage_date", "leadStageDate");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "application_stage_date": {
        const d = getLeadValue(lead, "application_stage_date", "applicationStageDate");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "reassigned_on": {
        const d = getLeadValue(lead, "reassigned_on", "reassignedOn");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "form_name": {
        const val = getLeadValue(lead, "form_name", "formName");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "referrer": {
        const val = getLeadValue(lead, "referrer", "referrer");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "source_url": {
        const url = getLeadValue(lead, "source_url", "sourceUrl");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{url ? <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline" onClick={e => e.stopPropagation()}>Link</a> : "-"}</div>;
      }
      case "insta_handle": {
        const val = getLeadValue(lead, "insta_handle", "instaHandle");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "crisp_chat_link": {
        const url = getLeadValue(lead, "crisp_chat_link", "crispChatLink");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{url ? <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline" onClick={e => e.stopPropagation()}>Link</a> : "-"}</div>;
      }
      case "cbb_link": {
        const url = getLeadValue(lead, "cbb_link", "cbbLink");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{url ? <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline" onClick={e => e.stopPropagation()}>Link</a> : "-"}</div>;
      }
      case "is_chatbot_lead": {
        const val = getLeadValue(lead, "is_chatbot_lead", "isChatbotLead");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "concat_smc": {
        const val = getLeadValue(lead, "concat_smc", "concatSmc");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "chat_summary": {
        const val = getLeadValue(lead, "chat_summary", "chatSummary");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "human_handoff": {
        const val = getLeadValue(lead, "human_handoff", "humanHandoff");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "form_completion_date": {
        const d = getLeadValue(lead, "form_completion_date", "formCompletionDate");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "application_form_initiated": {
        const val = getLeadValue(lead, "application_form_initiated", "applicationFormInitiated");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "application_form_submitted": {
        const val = getLeadValue(lead, "application_form_submitted", "applicationFormSubmitted");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "edit_access_granted_at": {
        const d = getLeadValue(lead, "edit_access_granted_at", "editAccessGrantedAt");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "edit_access_granted_by": {
        const val = getLeadValue(lead, "edit_access_granted_by", "editAccessGrantedBy");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "application_number": {
        const val = getLeadValue(lead, "application_number", "applicationNumber");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "final_decision": {
        const st = getLeadValue(lead, "final_decision", "finalDecision");
        return <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(st || "Unknown"))} title={st || "Unknown"}>{st || "Unknown"}</span>;
      }
      case "offer_letter_sent_at": {
        const d = getLeadValue(lead, "offer_letter_sent_at", "offerLetterSentAt");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "v1_lead_id": {
        const val = getLeadValue(lead, "v1_lead_id", "v1LeadId");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "v1_application_id": {
        const val = getLeadValue(lead, "v1_application_id", "v1ApplicationId");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "v1_user_id": {
        const val = getLeadValue(lead, "v1_user_id", "v1UserId");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "is_inbound_lead": {
        const val = getLeadValue(lead, "is_inbound_lead", "isInboundLead");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "application_registered_on": {
        const d = getLeadValue(lead, "application_registered_on", "applicationRegisteredOn");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "last_interacted_section": {
        const val = getLeadValue(lead, "last_interacted_section", "lastInteractedSection");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "timezone": {
        const val = getLeadValue(lead, "timezone", "timezone");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "counsellor": {
        const val = getLeadValue(lead, "counsellor", "counsellor");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "application_stage": {
        const st = getLeadValue(lead, "application_stage", "applicationStage");
        return <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(st || "Unknown"))} title={st || "Unknown"}>{st || "Unknown"}</span>;
      }
      case "application_sub_stage": {
        const st = getLeadValue(lead, "application_sub_stage", "applicationSubStage");
        return <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(st || "Unknown"))} title={st || "Unknown"}>{st || "Unknown"}</span>;
      }
      case "school": {
        const val = getLeadValue(lead, "school", "school");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "activity_tracker": {
        const val = getLeadValue(lead, "activity_tracker", "activityTracker");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "counsellor_last_activity_date": {
        const d = getLeadValue(lead, "counsellor_last_activity_date", "counsellorLastActivityDate");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "application_form_start_date": {
        const d = getLeadValue(lead, "application_form_start_date", "applicationFormStartDate");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "payment_initiated_date": {
        const d = getLeadValue(lead, "payment_initiated_date", "paymentInitiatedDate");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "payment_last_initiated_date": {
        const d = getLeadValue(lead, "payment_last_initiated_date", "paymentLastInitiatedDate");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "counsellor_first_activity_date": {
        const d = getLeadValue(lead, "counsellor_first_activity_date", "counsellorFirstActivityDate");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "application_fee_paid_on": {
        const d = getLeadValue(lead, "application_fee_paid_on", "applicationFeePaidOn");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "application_last_activity_date": {
        const d = getLeadValue(lead, "application_last_activity_date", "applicationLastActivityDate");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "last_lead_stage_updated": {
        const d = getLeadValue(lead, "last_lead_stage_updated", "lastLeadStageUpdated");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "first_lead_stage_updated": {
        const d = getLeadValue(lead, "first_lead_stage_updated", "firstLeadStageUpdated");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "application_form_submitted_on": {
        const d = getLeadValue(lead, "application_form_submitted_on", "applicationFormSubmittedOn");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate w-full">{d && !isNaN(new Date(d).getTime()) ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "-"}</div>;
      }
      case "notes": {
        const val = getLeadValue(lead, "notes", "notes");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "no_of_notes": {
        const val = getLeadValue(lead, "no_of_notes", "noOfNotes");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "perspect_ai_invitation_id": {
        const val = getLeadValue(lead, "perspect_ai_invitation_id", "perspectAiInvitationId");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "perspect_ai_exam_result": {
        const val = getLeadValue(lead, "perspect_ai_exam_result", "perspectAiExamResult");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      case "perspect_ai_magic_link": {
        const url = getLeadValue(lead, "perspect_ai_magic_link", "perspectAiMagicLink");
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{url ? <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline" onClick={e => e.stopPropagation()}>Link</a> : "-"}</div>;
      }
      case "perspect_ai_enable_test": {
        const val = getLeadValue(lead, "perspect_ai_enable_test", "perspectAiEnableTest");
        if (typeof val === 'boolean') return <div className="text-sm text-[var(--bolt-text-secondary)]">{val ? "Yes" : "No"}</div>;
        return <div className="text-sm text-[var(--bolt-text-secondary)] truncate max-w-[150px]">{val !== undefined && val !== null && val !== "" ? String(val) : "-"}</div>;
      }
      default: return null;
    }
  };

  return (
    <div className="w-full h-full overflow-auto">
      
      {/* Desktop Table View */}
      <table className="hidden md:table w-full min-w-max text-left text-sm whitespace-nowrap border-separate border-spacing-0 table-fixed">
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
                      "px-4 py-3 border-b border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-2)]",
                          (col.id.includes('stage') || col.id.includes('status') || col.id.includes('decision') || col.id.includes('result') || col.id.includes('type')) ? "text-center" : "text-left",
                      locked ? "sticky top-0 z-20" : "top-0 sticky z-[5]",
                      isLastLocked && "border-r shadow-[2px_0_6px_-2px_rgba(0,0,0,0.25)]"
                    )}
                    style={{ ...(locked ? { left: stickyLeft } : {}), width, minWidth: width, maxWidth: isLastActive ? undefined : width }}
                  >
                    <div className={cn("flex items-start gap-1.5 group/header w-full", (col.id.includes('stage') || col.id.includes('status') || col.id.includes('decision') || col.id.includes('result') || col.id.includes('type')) ? "justify-center" : "justify-start")}>
                      <button 
                        onClick={() => toggleLockedColumn(col.id)}
                        className={cn(
                          "shrink-0 transition-opacity p-0.5 rounded flex items-center justify-center",
                          locked 
                            ? "opacity-100 text-[var(--bolt-accent)]" 
                            : "opacity-0 group-hover/header:opacity-100 text-[var(--bolt-text-tertiary)] hover:text-[var(--bolt-text-primary)] hover:bg-[var(--bolt-hover-overlay)]"
                        )}
                        title={locked ? "Unfreeze up to here" : "Freeze up to here"}
                      >
                        {locked ? <Lock size={12} /> : <LockOpen size={12} />}
                      </button>
                      <span className={cn("flex-1 whitespace-normal leading-[1.2] break-words pt-0.5", (col.id.includes('stage') || col.id.includes('status') || col.id.includes('decision') || col.id.includes('result') || col.id.includes('type')) ? "text-center" : "text-left")}>{col.label}</span>
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
                  onClick={() => {
                    window.history.pushState(null, '', `/leads/${lead.uuid}`);
                    openDrawer(lead.uuid);
                  }}
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
                          (col.id.includes('stage') || col.id.includes('status') || col.id.includes('decision') || col.id.includes('result') || col.id.includes('type')) ? "text-center" : "text-left",
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
        {leads.length === 0 ? (
          <div className="px-4 py-24 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] flex items-center justify-center mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--bolt-text-secondary)]"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--bolt-text-primary)]">No leads found</h3>
            <p className="text-sm text-[var(--bolt-text-secondary)] px-4">Try adjusting your filters or search query to find what you're looking for.</p>
          </div>
        ) : leads.map((lead) => {
          const isSelected = selectedLeadIds.has(lead.uuid);
          const isUntouched = (lead.stage_name || (lead as any).stageName)?.toLowerCase() === "untouched";
          
          return (
            <div 
              key={lead.uuid}
              onClick={() => {
                window.history.pushState(null, '', `/leads/${lead.uuid}`);
                useUIStore.getState().openDrawer(lead.uuid);
              }}
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

