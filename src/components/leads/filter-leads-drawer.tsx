import { useViewStore, FilterCondition } from "@/stores/view-store";
import { X, Plus, Trash2, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FILTER_GROUPS = [
  {
    label: "LEAD DETAILS",
    fields: [
      { id: "counsellor_name", label: "Counsellor", type: "string" },
      { id: "previous_counsellor", label: "Previous Counsellor", type: "string" },
      { id: "tags", label: "Tags", type: "string" },
      { id: "stage_name", label: "Lead Stage", type: "string" },
      { id: "sub_stage_name", label: "Lead Sub Stage (select Lead Stage first)", type: "string" },
      { id: "application_stage_name", label: "Application Stage", type: "string" },
      { id: "application_sub_stage_name", label: "Application Sub Stage (select Application Stage first)", type: "string" },
    ]
  },
  {
    label: "OTHER DETAILS",
    fields: [
      { id: "reassigned_on", label: "Reassigned On", type: "date" },
      { id: "is_chatbot_lead", label: "Is Chatbot Lead", type: "boolean" },
      { id: "form_completion_date", label: "Form Completion Date", type: "date" },
      { id: "application_form_initiated", label: "Application Form Initiated", type: "date" },
      { id: "application_form_submitted", label: "Application Form Submitted", type: "date" },
      { id: "is_edit_access_granted", label: "Is Edit Access Granted", type: "boolean" },
      { id: "lead_type", label: "Type", type: "string" },
      { id: "source_url", label: "Source URL", type: "string" },
    ]
  }
];

const CONDITIONS = {
  string: ["is exactly", "is not", "contains", "does not contain", "is empty", "is not empty"],
  date: ["Before", "After", "Between"],
  boolean: ["is exactly"],
};

export function FilterLeadsDrawer() {
  const { isFilterDrawerOpen, setFilterDrawerOpen, views, activeViewId, updateActiveViewFilters } = useViewStore();
  const activeView = views.find(v => v.id === activeViewId);
  
  const [localFilters, setLocalFilters] = useState<FilterCondition[]>([]);
  const [matchType, setMatchType] = useState<"all"|"any">("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (activeView) {
      setLocalFilters(activeView.filters);
      setMatchType(activeView.matchType);
    }
  }, [activeView, isFilterDrawerOpen]);

  if (!mounted || !isFilterDrawerOpen) return null;

  const handleApply = () => {
    updateActiveViewFilters(localFilters, matchType);
    setFilterDrawerOpen(false);
  };

  const getFieldType = (fieldId: string) => {
    for (const group of FILTER_GROUPS) {
      const field = group.fields.find(f => f.id === fieldId);
      if (field) return field.type;
    }
    return "string";
  };

  const addFilter = () => {
    const firstField = FILTER_GROUPS[0].fields[0];
    setLocalFilters([...localFilters, { field: firstField.id, condition: CONDITIONS[firstField.type as keyof typeof CONDITIONS][0], value: "" }]);
  };

  const removeFilter = (idx: number) => {
    setLocalFilters(localFilters.filter((_, i) => i !== idx));
  };

  const updateFilter = (idx: number, key: keyof FilterCondition, val: string) => {
    const newFilters = [...localFilters];
    
    // If field changes, reset condition to default for that field's type
    if (key === "field") {
      const type = getFieldType(val) as keyof typeof CONDITIONS;
      newFilters[idx] = { ...newFilters[idx], field: val, condition: CONDITIONS[type][0], value: "" };
    } else {
      newFilters[idx] = { ...newFilters[idx], [key]: val };
    }
    
    setLocalFilters(newFilters);
  };

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in"
        onClick={() => setFilterDrawerOpen(false)}
      />
      
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] md:w-full max-w-3xl bg-[var(--bolt-bg-depth-1)] rounded-2xl z-[101] shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-[var(--bolt-border-color)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--bolt-border-color)] surface-2 shrink-0">
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-[var(--bolt-accent)]" />
            <h2 className="text-lg font-semibold text-[var(--bolt-text-primary)]">Filter Leads</h2>
          </div>
          <button 
            onClick={() => setFilterDrawerOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bolt-hover-overlay-md)] transition-colors"
          >
            <X size={18} className="text-[var(--bolt-text-secondary)]" />
          </button>
        </div>

        {/* Match Type Toggle */}
        <div className="pt-8 flex flex-col items-center justify-center">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-[var(--bolt-text-primary)]">Meet All Criteria</span>
            <div className="flex items-center bg-[var(--bolt-bg-depth-2)] rounded-full p-1 border border-[var(--bolt-border-color)]">
              <button 
                onClick={() => setMatchType("all")}
                className={cn(
                  "px-5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200", 
                  matchType === "all" ? "bg-[var(--bolt-accent)] text-white shadow-sm" : "text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]"
                )}
              >
                All
              </button>
              <button 
                onClick={() => setMatchType("any")}
                className={cn(
                  "px-5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200", 
                  matchType === "any" ? "bg-[var(--bolt-accent)] text-white shadow-sm" : "text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]"
                )}
              >
                Any
              </button>
            </div>
          </div>
        </div>

        {/* Filters List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {activeView?.backendFilterPayload ? (
            <div className="text-center py-12 text-[var(--bolt-text-secondary)] text-sm">
              <div className="font-semibold text-[var(--bolt-text-primary)] mb-2">This is an Imported Backend View</div>
              The filters for this view are processed entirely on the server.
            </div>
          ) : localFilters.length === 0 ? (
            <div className="text-center py-12 text-[var(--bolt-text-secondary)] text-sm">
              No filters applied yet. Click + to add a condition.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {localFilters.map((filter, index) => {
                const fieldType = getFieldType(filter.field) as keyof typeof CONDITIONS;
                const fieldConditions = CONDITIONS[fieldType] || CONDITIONS.string;
                const isBoolean = fieldType === "boolean";
                const isDate = fieldType === "date";
                const isBetween = isDate && filter.condition === "Between";

                return (
                  <div key={index} className="flex gap-3 items-start relative group">
                    <div className="flex items-center justify-center w-8 h-10 shrink-0">
                      <button 
                        onClick={() => removeFilter(index)}
                        className="text-[var(--bolt-text-tertiary)] hover:text-rose-500 hover:bg-rose-500/10 w-6 h-6 flex items-center justify-center rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Field Selection */}
                      <select 
                        className="w-full text-[13px] font-medium px-3 h-10 rounded-lg border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-1)] outline-none focus:border-[var(--bolt-accent)]"
                        value={filter.field}
                        onChange={(e) => updateFilter(index, "field", e.target.value)}
                      >
                        {FILTER_GROUPS.map(group => (
                          <optgroup key={group.label} label={group.label}>
                            {group.fields.map(field => (
                              <option key={field.id} value={field.id}>{field.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      
                      {/* Condition Selection */}
                      <select 
                        className="w-full text-[13px] font-medium px-3 h-10 rounded-lg border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-1)] outline-none focus:border-[var(--bolt-accent)]"
                        value={filter.condition}
                        onChange={(e) => updateFilter(index, "condition", e.target.value)}
                      >
                        {fieldConditions.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      
                      {/* Value Input */}
                      {!["is empty", "is not empty"].includes(filter.condition) && (
                        <div className="w-full flex gap-2">
                          {isBoolean ? (
                            <select 
                              className="w-full text-[13px] px-3 h-10 rounded-lg border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-1)] outline-none focus:border-[var(--bolt-accent)]"
                              value={filter.value}
                              onChange={(e) => updateFilter(index, "value", e.target.value)}
                            >
                              <option value="">Select option</option>
                              <option value="true">True</option>
                              <option value="false">False</option>
                            </select>
                          ) : isDate ? (
                            isBetween ? (
                              <>
                                <input 
                                  type="date"
                                  className="w-1/2 text-[13px] px-3 h-10 rounded-lg border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-1)] outline-none focus:border-[var(--bolt-accent)]"
                                  value={filter.value.split(',')[0] || ''}
                                  onChange={(e) => updateFilter(index, "value", `${e.target.value},${filter.value.split(',')[1] || ''}`)}
                                />
                                <input 
                                  type="date"
                                  className="w-1/2 text-[13px] px-3 h-10 rounded-lg border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-1)] outline-none focus:border-[var(--bolt-accent)]"
                                  value={filter.value.split(',')[1] || ''}
                                  onChange={(e) => updateFilter(index, "value", `${filter.value.split(',')[0] || ''},${e.target.value}`)}
                                />
                              </>
                            ) : (
                              <input 
                                type="date"
                                className="w-full text-[13px] px-3 h-10 rounded-lg border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-1)] outline-none focus:border-[var(--bolt-accent)]"
                                value={filter.value}
                                onChange={(e) => updateFilter(index, "value", e.target.value)}
                              />
                            )
                          ) : (
                            <input 
                              type="text"
                              placeholder="Value..."
                              className="w-full text-[13px] px-3 h-10 rounded-lg border border-[var(--bolt-border-color)] bg-[var(--bolt-bg-depth-1)] outline-none focus:border-[var(--bolt-accent)] placeholder:text-[var(--bolt-text-tertiary)]"
                              value={filter.value}
                              onChange={(e) => updateFilter(index, "value", e.target.value)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {!activeView?.backendFilterPayload && (
            <div className="flex items-center pl-10 mt-4">
              <button 
                onClick={addFilter}
                className="flex items-center justify-center w-8 h-8 rounded-full border border-dashed border-[var(--bolt-text-tertiary)] text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-accent)] hover:border-[var(--bolt-accent)] hover:bg-[var(--bolt-accent)]/10 transition-all"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-[var(--bolt-border-color)] flex items-center justify-between surface-2 relative">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLocalFilters([])}
              className="px-4 py-2 text-[13px] font-semibold text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)] transition-colors border border-[var(--bolt-border-color)] rounded-lg bg-transparent hover:bg-[var(--bolt-hover-overlay)]"
            >
              Reset
            </button>
            
            {/* Inline Import UI instead of window.prompt */}
            <div className="relative group">
              <button 
                onClick={() => {
                  try {
                    // Just take clipboard text directly for a better UX than prompt
                    navigator.clipboard.readText().then(text => {
                      if (!text) {
                        toast.error("Clipboard is empty");
                        return;
                      }
                      const payload = JSON.parse(text);
                      const name = `Imported View ${Math.floor(Math.random() * 1000)}`;
                      useViewStore.getState().createView(name, payload);
                      toast.success(`Successfully imported view as '${name}'`);
                      setFilterDrawerOpen(false);
                    }).catch(() => {
                      toast.error("Please copy the JSON payload to your clipboard first, then click Import");
                    });
                  } catch (_e) {
                    toast.error("Invalid JSON format in clipboard");
                  }
                }}
                className="px-4 py-2 text-[13px] font-semibold text-[var(--bolt-accent)] bg-[var(--bolt-accent)]/10 hover:bg-[var(--bolt-accent)]/20 transition-colors rounded-lg border border-[var(--bolt-accent)]/20"
              >
                Import from Clipboard
              </button>
            </div>
          </div>
          <button 
            onClick={handleApply}
            className="px-6 py-2.5 bg-[var(--bolt-accent)] hover:bg-[var(--bolt-accent-hover)] text-black font-semibold text-[13px] rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
