import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemePreference = "light" | "dark" | "system";

interface SettingsState {
  notificationPreference: "both" | "toast" | "os";
  setNotificationPreference: (pref: "both" | "toast" | "os") => void;
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationPreference: "both",
      setNotificationPreference: (pref) => set({ notificationPreference: pref }),
      themePreference: "system",
      setThemePreference: (theme) => set({ themePreference: theme }),
    }),
    {
      name: "bolt-crm-settings",
    }
  )
);
