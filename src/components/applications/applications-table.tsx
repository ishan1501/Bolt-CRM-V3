import { Lead } from "@/types/crm";
import { format } from "date-fns";
import { useUIStore } from "@/stores/ui-store";
import { cn, getBadgeColor } from "@/lib/utils";
import { PhoneCall } from "lucide-react";
import { logCallToSupabase } from "@/lib/log-call";
import { useRouter } from "next/navigation";

export function ApplicationsTable({ apps }: { apps: Lead[] }) {
  const router = useRouter();

  if (apps.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--bolt-text-secondary)]">
        No applications found.
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      
      {/* Desktop Table View */}
      <table className="hidden md:table w-full min-w-max text-left text-sm whitespace-nowrap border-separate border-spacing-0">
        <thead className="bg-[var(--bolt-bg-depth-2)]/80 backdrop-blur-md text-xs uppercase text-[var(--bolt-text-secondary)] font-semibold sticky top-0 z-10 shadow-sm border-b border-[var(--bolt-border-color)]">
          <tr>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Lead Type</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Registered Name</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Registered Email</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Registered Mobile</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">School Name</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Form Title</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Stage Name</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Sub Stage Name</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Counsellor Name</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Created At</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Is Edit Access Granted</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Is Payment Done</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Payment Status</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Previous Lead Stage</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Application Stage Name</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Application Sub Stage Name</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Previous Counsellor</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Reassigned By</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Form Uuid</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Number Of Notes</th>
            <th className="px-4 py-3 border-b border-[var(--bolt-border-color)]">Tags</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--bolt-border-color)]">
          {apps.map((app, index) => {
            const a = app as any;
            
            // Format dates safely
            const regDateFormatted = app.created_at || a.createdAt || a.capturedOn 
              ? format(new Date(app.created_at || a.createdAt || a.capturedOn), "dd MMM yyyy, hh:mm a") 
              : "-";
              
            // Safely get application specific fields
            const paymentStatus = a.paymentStatus || app.payment_status || "-";
            const paymentIsPaid = String(paymentStatus).toLowerCase() === "paid" || String(paymentStatus).toLowerCase() === "success" || a.is_payment_done;
            const schoolName = a.schoolName || app.school_name || a.schoolData?.name || "-";
            
            return (
              <tr 
                key={app.uuid || index} 
                onClick={() => router.push(`/leads/${app.uuid}`)}
                className="hover:bg-[var(--bolt-bg-depth-2)] cursor-pointer group transition-colors"
              >
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)]">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#1a1a1a] dark:text-slate-300 dark:border-[#333]">
                    {app.lead_type || "Primary"}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] font-medium text-[var(--bolt-text-primary)] group-hover:underline max-w-[150px] truncate">
                  {app.registered_name || "Unknown"}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)] max-w-[180px] truncate">
                  {app.registered_email || "-"}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]">
                  {app.registered_mobile || "-"}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]">
                  {schoolName}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] font-medium text-[var(--bolt-text-primary)] max-w-[150px] truncate">
                  {app.form_title || a.formTitle || "-"}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)]">
                  <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(app.stage_name || "Unknown"))} title={app.stage_name || "Unknown"}>
                    {app.stage_name || "Unknown"}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)]">
                  <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(app.sub_stage_name || "NA"))} title={app.sub_stage_name || "NA"}>
                    {app.sub_stage_name || "NA"}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]">
                  {a.counsellorName || app.counsellor_name || "-"}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]">
                  {regDateFormatted}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]">
                  {a.isEditAccessGranted || app.is_edit_access_granted ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]">
                  {paymentIsPaid ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)]">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                    paymentIsPaid 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50" 
                      : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#1a1a1a] dark:text-slate-300 dark:border-[#333]"
                  }`}>
                    {paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]">
                  {a.previousLeadStage || app.previous_lead_stage || "-"}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)]">
                  <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(a.applicationStageName || app.application_stage_name || "-"))} title={a.applicationStageName || app.application_stage_name || "-"}>
                    {a.applicationStageName || app.application_stage_name || "-"}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)]">
                  <span className={cn("inline-block max-w-[130px] truncate align-middle px-2 py-0.5 rounded-full text-xs font-medium border", getBadgeColor(a.applicationSubStageName || app.application_sub_stage_name || "-"))} title={a.applicationSubStageName || app.application_sub_stage_name || "-"}>
                    {a.applicationSubStageName || app.application_sub_stage_name || "-"}
                  </span>
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]">
                  {a.previousCounsellor || app.previous_counsellor || "-"}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]">
                  {a.reassignedBy || app.reassigned_by || "-"}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)] font-mono text-xs">
                  {a.formUuid || app.form_title ? "uuid-x-x" : "-"}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]">
                  {app.number_of_notes || a.numberOfNotes || a.notesCount || 0}
                </td>
                <td className="px-4 py-3 border-b border-[var(--bolt-border-color)] text-[var(--bolt-text-secondary)]">
                  {app.tags && app.tags.length > 0 ? app.tags.join(", ") : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col divide-y divide-[var(--bolt-border-color)]">
        {apps.map((app, index) => {
          const a = app as any;
          const appStage = a.applicationStageName || app.application_stage_name || app.stage_name || "Unknown";
          const paymentStatus = a.paymentStatus || a.payment_status || (a.is_payment_done ? "Paid" : "-");
          const paymentIsPaid = paymentStatus.toLowerCase() === "paid" || paymentStatus.toLowerCase() === "success" || a.is_payment_done;
          
          return (
            <div 
              key={app.uuid || index}
              onClick={() => router.push(`/leads/${app.uuid}`)}
              className="p-4 flex gap-3 transition-colors cursor-pointer bg-[var(--bolt-bg-depth-1)] active:bg-[var(--bolt-bg-depth-2)]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <h3 className="font-semibold text-[15px] text-[var(--bolt-text-primary)] truncate">
                    {app.registered_name || "Unknown"}
                  </h3>
                  <span className={cn("shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-medium border", getBadgeColor(appStage))}>
                    {appStage}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-[13px] font-medium text-[var(--bolt-text-secondary)] truncate">
                    {app.form_title || a.formTitle || "—"}
                  </div>
                  {paymentIsPaid && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Paid
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--bolt-text-tertiary)]">
                  <span className="truncate max-w-[140px]">{app.registered_email || "—"}</span>
                  <span>{app.registered_mobile || "—"}</span>
                </div>
              </div>
              
              {app.registered_mobile && (
                <div className="flex items-center justify-center shrink-0 pl-1">
                  <a 
                    href={`tel:${app.registered_mobile}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const name = app.registered_name || "Unknown Lead";
                      logCallToSupabase(app.uuid, name, app.registered_mobile || (app as any).mobile);
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
      </div>

    </div>
  );
}

