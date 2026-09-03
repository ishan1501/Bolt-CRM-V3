import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLeadProfile } from "@/hooks/use-lead-profile";
import { Send, MessageSquare, Settings } from "lucide-react";
import { toast } from "sonner";
import { useTemplateStore } from "@/stores/template-store";
import { useUIStore } from "@/stores/ui-store";

import { useRouter } from "next/navigation";

export function WhatsAppTab({ uuid }: { uuid: string }) {
  const { profile, rawProfile } = useLeadProfile(uuid);
  const { templates } = useTemplateStore();
  const router = useRouter();

  const waTemplates = templates.filter(t => t.type === "whatsapp");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  useEffect(() => {
    if (waTemplates.length > 0 && !waTemplates.find(t => t.id === selectedTemplate)) {
      setSelectedTemplate(waTemplates[0].id);
    }
  }, [waTemplates, selectedTemplate]);

  const activeTemplate = waTemplates.find(t => t.id === selectedTemplate);
  
  const leadName = profile?.name || "there";
  const formTitle = profile?.formTitle || "the program";

  const handleSend = () => {
    if (!profile?.mobile) {
      toast.error("Lead has no mobile number");
      return;
    }
    
    if (!activeTemplate) return;

    let message = activeTemplate.body.replace(/{leadName}/g, leadName);
    message = message.replace(/{formTitle}/g, formTitle);
    
    // Format number for WhatsApp (remove + and spaces)
    let phone = profile.mobile.replace(/[^0-9]/g, "");
    if (profile.countryCode) {
       phone = `${profile.countryCode.replace(/[^0-9]/g, "")}${phone}`;
    }
    
    const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(url, "whatsapp_web");
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="surface-2 shadow-sm border border-[var(--bolt-border-color)] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--bolt-border-color)] surface-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-green-500" />
            <h3 className="font-semibold text-[var(--bolt-text-primary)]">Send WhatsApp Message</h3>
          </div>
          <button 
            onClick={() => router.push("/settings")}
            className="text-[11px] font-semibold text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)] flex items-center gap-1 bg-[var(--bolt-bg-depth-3)] px-2 py-1 rounded"
          >
            <Settings size={12} />
            Manage Templates
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {waTemplates.length === 0 ? (
            <div className="text-center py-8 text-[var(--bolt-text-secondary)] text-sm space-y-3">
              <p>No WhatsApp templates found.</p>
              <Button size="sm" variant="outline" onClick={() => router.push('/settings')}>Create a Template</Button>
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
                  {waTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[var(--bolt-text-secondary)] uppercase tracking-wider">Message Preview</label>
                <div className="p-4 rounded-lg surface-3 border border-[var(--bolt-border-color)] text-sm text-[var(--bolt-text-primary)] min-h-[100px] whitespace-pre-wrap">
                  {activeTemplate?.body.replace(/{leadName}/g, leadName).replace(/{formTitle}/g, formTitle)}
                </div>
              </div>

              <Button onClick={handleSend} className="w-full bg-green-600 hover:bg-green-700 text-white">
                <Send size={16} className="mr-2" />
                Open WhatsApp Web
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
