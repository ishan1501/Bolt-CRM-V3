import { useState } from "react";
import { useTemplateStore, Template } from "@/stores/template-store";
import { Button } from "./button";
import { Plus, Trash2, Mail, MessageSquare, Save, X, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export function TemplateSettings() {
  const { templates, addTemplate, updateTemplate, removeTemplate } = useTemplateStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Template>>({});
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (t: Template) => {
    setEditingId(t.id);
    setDraft({ ...t });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingId("new");
    setIsCreating(true);
    setDraft({ name: "", type: "whatsapp", body: "", subject: "" });
  };

  const handleSave = () => {
    if (!draft.name || !draft.body) return;
    
    if (isCreating) {
      addTemplate(draft as Omit<Template, 'id'>);
    } else if (editingId) {
      updateTemplate(editingId, draft);
    }
    
    setEditingId(null);
    setIsCreating(false);
  };

  const activeTemplate = isCreating ? draft : templates.find(t => t.id === editingId);

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[var(--bolt-bg-depth-1)]">
      {/* Sidebar: List of Templates */}
      <div className={cn(
        "flex-col w-full md:w-72 lg:w-80 border-r border-[var(--bolt-border-color)] h-full",
        editingId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-4 border-b border-[var(--bolt-border-color)] flex items-center justify-between shrink-0 surface-2">
          <h3 className="font-semibold text-[var(--bolt-text-primary)]">All Templates</h3>
          <button 
            onClick={handleCreate}
            className="p-1.5 bg-[var(--bolt-accent)] text-black rounded-lg hover:bg-[var(--bolt-accent)]/90 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {templates.length === 0 ? (
            <div className="p-4 text-center text-sm text-[var(--bolt-text-secondary)]">
              No templates yet. Click + to create one.
            </div>
          ) : (
            templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleEdit(t)}
                className={cn(
                  "w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors",
                  editingId === t.id 
                    ? "bg-[var(--bolt-accent)]/10 border border-[var(--bolt-accent)]/20" 
                    : "hover:bg-[var(--bolt-bg-depth-2)] border border-transparent"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  t.type === 'email' ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                )}>
                  {t.type === 'email' ? <Mail size={14} /> : <MessageSquare size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate text-[var(--bolt-text-primary)]">{t.name}</div>
                  <div className="text-xs text-[var(--bolt-text-secondary)] truncate">
                    <span className="capitalize">{t.type}</span>
                    {t.useCase && <span className="opacity-60"> • {t.useCase}</span>}
                  </div>
                  {t.program && (
                    <div className="text-[10px] text-[var(--bolt-text-secondary)]/70 truncate mt-0.5 font-medium">
                      {t.program}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Area: Editor */}
      <div className={cn(
        "flex-1 flex-col h-full bg-[var(--bolt-bg-depth-2)]",
        !editingId ? "hidden md:flex items-center justify-center" : "flex"
      )}>
        {!editingId ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-[var(--bolt-bg-depth-3)] rounded-full flex items-center justify-center">
              <Smartphone size={24} className="text-[var(--bolt-text-secondary)]" />
            </div>
            <div className="text-[var(--bolt-text-secondary)] text-sm">Select a template to edit or create a new one.</div>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-[var(--bolt-border-color)] flex items-center justify-between shrink-0 bg-[var(--bolt-bg-depth-1)]">
              <div className="flex items-center gap-2">
                <button 
                  className="md:hidden p-2 -ml-2 text-[var(--bolt-text-secondary)]"
                  onClick={() => setEditingId(null)}
                >
                  <X size={18} />
                </button>
                <h3 className="font-semibold text-lg">{isCreating ? "Create Template" : "Edit Template"}</h3>
              </div>
              <div className="flex items-center gap-2">
                {!isCreating && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this template?")) {
                        removeTemplate(editingId);
                        setEditingId(null);
                      }
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} className="md:mr-2" />
                    <span className="hidden md:inline">Delete</span>
                  </Button>
                )}
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={!draft.name || !draft.body}
                >
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
              <div className="max-w-3xl mx-auto space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Template Name</label>
                    <input 
                      type="text" 
                      value={draft.name || ""}
                      onChange={e => setDraft({ ...draft, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl surface-input border border-[var(--bolt-border-color)] text-sm outline-none focus:border-[var(--bolt-accent)] transition-colors"
                      placeholder="e.g. Follow Up #1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Type</label>
                    <select
                      value={draft.type || "whatsapp"}
                      onChange={e => setDraft({ ...draft, type: e.target.value as "email" | "whatsapp" })}
                      className="w-full px-4 py-3 rounded-xl surface-input border border-[var(--bolt-border-color)] text-sm outline-none focus:border-[var(--bolt-accent)] transition-colors"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Program / Course (Optional)</label>
                    <input 
                      type="text" 
                      value={draft.program || ""}
                      onChange={e => setDraft({ ...draft, program: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl surface-input border border-[var(--bolt-border-color)] text-sm outline-none focus:border-[var(--bolt-accent)] transition-colors"
                      placeholder="e.g. AI-First Operator #27"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Use Case (Optional)</label>
                    <input 
                      type="text" 
                      value={draft.useCase || ""}
                      onChange={e => setDraft({ ...draft, useCase: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl surface-input border border-[var(--bolt-border-color)] text-sm outline-none focus:border-[var(--bolt-accent)] transition-colors"
                      placeholder="e.g. Welcome Series"
                    />
                  </div>
                </div>

                {draft.type === "email" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Email Subject</label>
                    <input 
                      type="text" 
                      value={draft.subject || ""}
                      onChange={e => setDraft({ ...draft, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl surface-input border border-[var(--bolt-border-color)] text-sm outline-none focus:border-[var(--bolt-accent)] transition-colors"
                      placeholder="Subject line..."
                    />
                  </div>
                )}

                <div className="space-y-2 flex-1 flex flex-col min-h-[300px]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Message Body</label>
                    <div className="text-[10px] text-[var(--bolt-text-secondary)]">Use {'{name}'} for lead name</div>
                  </div>
                  <textarea 
                    value={draft.body || ""}
                    onChange={e => setDraft({ ...draft, body: e.target.value })}
                    className="w-full flex-1 px-4 py-4 rounded-xl surface-input border border-[var(--bolt-border-color)] text-sm outline-none focus:border-[var(--bolt-accent)] transition-colors resize-none custom-scrollbar min-h-[300px]"
                    placeholder="Write your message here..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
