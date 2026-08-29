import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Template {
  id: string;
  name: string;
  type: 'email' | 'whatsapp';
  subject?: string;
  body: string;
}

interface TemplateState {
  templates: Template[];
  addTemplate: (template: Omit<Template, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  removeTemplate: (id: string) => void;
}

const defaultTemplates: Template[] = [
  {
    id: "default-wa-1",
    name: "Initial Outreach",
    type: "whatsapp",
    body: "Hi {leadName}, thank you for your interest in {formTitle}! We would love to connect and share more details."
  },
  {
    id: "default-email-1",
    name: "Program Details",
    type: "email",
    subject: "Information regarding {formTitle}",
    body: "Hello {leadName},\n\nThank you for applying to the {formTitle} program. Please find the details attached below."
  }
];

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set) => ({
      templates: defaultTemplates,
      addTemplate: (templateData) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({ 
          templates: [...state.templates, { ...templateData, id }] 
        }));
      },
      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },
      removeTemplate: (id) => {
        set((state) => ({ 
          templates: state.templates.filter((t) => t.id !== id) 
        }));
      },
    }),
    {
      name: 'bolt-templates',
    }
  )
);
