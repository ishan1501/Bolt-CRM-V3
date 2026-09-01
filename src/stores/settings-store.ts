import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  notificationPreference: "both" | "toast" | "os";
  setNotificationPreference: (pref: "both" | "toast" | "os") => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationPreference: "both",
      setNotificationPreference: (pref) => set({ notificationPreference: pref }),
    }),
    {
      name: "bolt-crm-settings",
    }
  )
);
