import { useState } from "react";
import { useTemplateStore, Template } from "@/stores/template-store";
import { Button } from "./button";
import { Plus, Trash2, Edit2 } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold">Message Templates</h3>
        {!editingId && (
          <Button size="sm" onClick={handleCreate}>
            <Plus size={14} className="mr-1.5" />
            New Template
          </Button>
        )}
      </div>

      {editingId ? (
        <div className="surface-2 p-4 rounded-lg border border-[var(--bolt-border-color)] space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-[var(--bolt-text-secondary)]">Template Name</label>
              <input 
                type="text" 
                value={draft.name || ""}
                onChange={e => setDraft({ ...draft, name: e.target.value })}
                className="surface-input mt-1.5 block w-full rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Initial Outreach"
              />
            </div>
            <div className="w-40">
              <label className="text-xs font-medium text-[var(--bolt-text-secondary)]">Type</label>
              <select 
                value={draft.type || "whatsapp"}
                onChange={e => setDraft({ ...draft, type: e.target.value as any })}
                className="surface-input mt-1.5 block w-full rounded-lg px-3 py-2 text-sm cursor-pointer"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>

          {draft.type === "email" && (
            <div>
              <label className="text-xs font-medium text-[var(--bolt-text-secondary)]">Email Subject</label>
              <input 
                type="text" 
                value={draft.subject || ""}
                onChange={e => setDraft({ ...draft, subject: e.target.value })}
                className="surface-input mt-1.5 block w-full rounded-lg px-3 py-2 text-sm"
                placeholder="Subject line..."
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-[var(--bolt-text-secondary)] mb-1 block flex justify-between">
              <span>Message Body</span>
              <span className="text-[10px] text-[var(--bolt-text-tertiary)]">Supports placeholders: {'{leadName}'}, {'{formTitle}'}</span>
            </label>
            <textarea 
              value={draft.body || ""}
              onChange={e => setDraft({ ...draft, body: e.target.value })}
              className="surface-input block w-full rounded-lg px-3 py-2 text-sm min-h-[120px] resize-y"
              placeholder="Write your message template here..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--bolt-border-color)]">
            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!draft.name || !draft.body}>
              Save Template
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.length === 0 ? (
            <div className="text-center p-6 border border-dashed border-[var(--bolt-border-color)] rounded-xl text-[var(--bolt-text-tertiary)] text-sm">
              No templates saved yet. Create one to use it in the Lead Profile.
            </div>
          ) : (
            templates.map(t => (
              <div key={t.id} className="surface-2 p-3 rounded-lg border border-[var(--bolt-border-color)] flex items-start justify-between group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--bolt-text-primary)] text-sm">{t.name}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/20 text-[var(--bolt-text-secondary)]">
                      {t.type}
                    </span>
                  </div>
                  {t.type === "email" && t.subject && (
                    <div className="text-xs font-medium text-[var(--bolt-text-secondary)]">Sub: {t.subject}</div>
                  )}
                  <div className="text-xs text-[var(--bolt-text-tertiary)] line-clamp-1">{t.body}</div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(t)} className="p-1.5 hover:bg-white/10 rounded-md text-[var(--bolt-text-secondary)] hover:text-white" title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => removeTemplate(t.id)} className="p-1.5 hover:bg-white/10 rounded-md text-[var(--bolt-text-secondary)] hover:text-red-400" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
