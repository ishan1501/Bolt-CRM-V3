import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

const idbStorage = {
  getItem: async (name: string) => (await get(name)) || null,
  setItem: async (name: string, value: string) => await set(name, value),
  removeItem: async (name: string) => await del(name),
};

export interface LeadSnapshot {
  uuid: string;
  name: string;
  phone: string;
  stageName: string;
}

interface LeadsSnapshotState {
  snapshot: Record<string, LeadSnapshot>;
  updateSnapshot: (newSnapshot: Record<string, LeadSnapshot>) => void;
}

export const useLeadsSnapshotStore = create<LeadsSnapshotState>()(
  persist(
    (set) => ({
      snapshot: {},
      updateSnapshot: (newSnapshot) => set({ snapshot: newSnapshot })
    }),
    {
      name: "bolt-crm-leads-snapshot-v2",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
