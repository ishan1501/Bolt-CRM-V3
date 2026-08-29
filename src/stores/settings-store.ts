import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

const idbStorage = {
  getItem: async (name: string) => (await get(name)) || null,
  setItem: async (name: string, value: string) => await set(name, value),
  removeItem: async (name: string) => await del(name),
};

interface SettingsState {
  autoStageEnabled: boolean;
  autoStageTargetStage: any;
  setAutoStage: (enabled: boolean, stage?: any) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoStageEnabled: false,
      autoStageTargetStage: null,
      setAutoStage: (enabled, stage) => set((state) => ({
        autoStageEnabled: enabled,
        autoStageTargetStage: stage !== undefined ? stage : state.autoStageTargetStage
      }))
    }),
    {
      name: "bolt-crm-settings",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
