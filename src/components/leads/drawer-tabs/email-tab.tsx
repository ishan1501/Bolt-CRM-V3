import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLeadProfile } from "@/hooks/use-lead-profile";
import { Mail, Send, Settings } from "lucide-react";
import { toast } from "sonner";
import { useTemplateStore } from "@/stores/template-store";
import { useUIStore } from "@/stores/ui-store";

export function EmailTab({ uuid }: { uuid: string }) {
  const { profile, rawProfile } = useLeadProfile(uuid);
  const { templates } = useTemplateStore();
  const { setSettingsOpen } = useUIStore();
  
  const emailTemplates = templates.filter(t => t.type === "email");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  useEffect(() => {
    if (emailTemplates.length > 0 && !emailTemplates.find(t => t.id === selectedTemplate)) {
      setSelectedTemplate(emailTemplates[0].id);
    }
  }, [emailTemplates, selectedTemplate]);

  const activeTemplate = emailTemplates.find(t => t.id === selectedTemplate);
  
  const leadName = profile?.name || "there";
  const formTitle = profile?.formTitle || "the program";

  const handleSend = () => {
    if (!profile?.email) {
      toast.error("Lead has no email address");
      return;
    }
    
    if (!activeTemplate) return;

    let message = activeTemplate.body.replace(/{leadName}/g, leadName);
    message = message.replace(/{formTitle}/g, formTitle);
    
    let subject = (activeTemplate.subject || "").replace(/{leadName}/g, leadName);
    subject = subject.replace(/{formTitle}/g, formTitle);
    
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${profile.email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(url, "gmail_compose");
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="surface-2 shadow-sm border border-[var(--bolt-border-color)] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--bolt-border-color)] surface-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-blue-400" />
            <h3 className="font-semibold text-[var(--bolt-text-primary)]">Send Email</h3>
          </div>
          <button 
            onClick={() => setSettingsOpen(true)}
            className="text-[11px] font-semibold text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)] flex items-center gap-1 bg-black/10 px-2 py-1 rounded"
          >
            <Settings size={12} />
            Manage Templates
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {emailTemplates.length === 0 ? (
            <div className="text-center py-8 text-[var(--bolt-text-secondary)] text-sm space-y-3">
              <p>No email templates found.</p>
              <Button size="sm" variant="outline" onClick={() => setSettingsOpen(true)}>Create a Template</Button>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Select Template</label>
                <select
                  className="w-full px-4 py-2.5 rounded-lg border surface-3 border-[var(--bolt-border-color)] text-[13px] font-semibold outline-none cursor-pointer"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  {emailTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Subject Preview</label>
                <div className="px-4 py-2 rounded-lg surface-3 border border-[var(--bolt-border-color)] text-sm text-[var(--bolt-text-primary)]">
                  {activeTemplate?.subject?.replace(/{leadName}/g, leadName).replace(/{formTitle}/g, formTitle) || "No subject"}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Message Preview</label>
                <div className="p-4 rounded-lg surface-3 border border-[var(--bolt-border-color)] text-sm text-[var(--bolt-text-primary)] min-h-[150px] whitespace-pre-wrap">
                  {activeTemplate?.body.replace(/{leadName}/g, leadName).replace(/{formTitle}/g, formTitle)}
                </div>
              </div>

              <Button onClick={handleSend} className="w-full bg-[var(--bolt-accent)] hover:bg-[var(--bolt-accent-hover)] text-white">
                <Send size={16} className="mr-2" />
                Open Gmail
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
