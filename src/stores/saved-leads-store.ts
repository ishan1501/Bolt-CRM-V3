import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface SavedLead {
  uuid: string;
  name: string;
  email: string;
  mobile: string;
  stageName: string;
  timestamp: number;
  note?: string;
  dbId?: string; // Supabase row id
}

interface SavedLeadsState {
  savedLeads: SavedLead[];
  isLoading: boolean;
  fetchLeads: () => Promise<void>;
  saveLead: (lead: SavedLead) => Promise<void>;
  removeLead: (uuid: string, dbId?: string) => Promise<void>;
  isLeadSaved: (uuid: string) => boolean;
}

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("bolt_user") || "{}");
    return user.email || user.id || "unknown";
  } catch (e) {
    return "unknown";
  }
};

export const useSavedLeadsStore = create<SavedLeadsState>((set, get) => ({
  savedLeads: [],
  isLoading: false,

  fetchLeads: async () => {
    set({ isLoading: true });
    const userId = getUserId();
    const { data, error } = await supabase
      .from("saved_leads")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const parsedLeads: SavedLead[] = data.map((row: any) => {
        let noteData = { note: "", name: "Unknown", email: "", mobile: "", stageName: "" };
        try {
          noteData = JSON.parse(row.note || "{}");
        } catch (e) {}
        
        return {
          uuid: row.lead_uuid,
          name: noteData.name,
          email: noteData.email,
          mobile: noteData.mobile,
          stageName: noteData.stageName,
          note: noteData.note,
          timestamp: new Date(row.created_at).getTime(),
          dbId: row.id,
        };
      });
      set({ savedLeads: parsedLeads, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  saveLead: async (lead) => {
    // Optimistic update
    const current = get().savedLeads;
    if (current.some(l => l.uuid === lead.uuid)) return; // Already saved
    
    set({ savedLeads: [lead, ...current] });

    const userId = getUserId();
    
    // Stringify the data into the note field so we don't have to alter the schema
    const notePayload = JSON.stringify({
      name: lead.name,
      email: lead.email,
      mobile: lead.mobile,
      stageName: lead.stageName,
      note: lead.note || ""
    });

    const { data, error } = await supabase
      .from("saved_leads")
      .insert([
        {
          user_id: userId,
          lead_uuid: lead.uuid,
          note: notePayload
        }
      ])
      .select();
      
    if (data && data.length > 0) {
      // Update with the actual DB id
      set((state) => ({
        savedLeads: state.savedLeads.map(l => l.uuid === lead.uuid ? { ...l, dbId: data[0].id } : l)
      }));
    }
  },

  removeLead: async (uuid, dbId?: string) => {
    const userId = getUserId();
    // Optimistic update
    set((state) => ({
      savedLeads: state.savedLeads.filter(l => dbId ? l.dbId !== dbId : l.uuid !== uuid)
    }));

    const query = supabase.from("saved_leads").delete().eq("user_id", userId);
    
    if (dbId) {
      await query.eq("id", dbId);
    } else {
      await query.eq("lead_uuid", uuid);
    }
  },

  isLeadSaved: (uuid) => {
    return get().savedLeads.some(l => l.uuid === uuid);
  }
}));
