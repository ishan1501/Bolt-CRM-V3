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
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
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
                          ? "text-[var(--bolt-text-primary)] hover:bg-white/10"
                          : "text-[var(--bolt-text-tertiary)] hover:text-[var(--bolt-accent)] hover:bg-white/5"
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
