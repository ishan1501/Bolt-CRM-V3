import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";
import { Reminder } from "@/types/crm";

// Custom IndexedDB storage for Zustand
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface ReminderState {
  reminders: Reminder[];
  addReminder: (reminder: Reminder) => void;
  removeReminder: (id: string) => void;
  markCompleted: (id: string) => void;
  getUpcomingReminders: () => Reminder[];
  getOverdueReminders: () => Reminder[];
  pruneOldReminders: () => void;
  fetchRemindersFromBackend: () => Promise<void>;
}

const syncReminderToBackend = async (action: "upsert" | "delete", reminder?: Reminder, id?: string) => {
  try {
    if (typeof window === "undefined") return;
    const user = JSON.parse(localStorage.getItem("bolt_user") || "{}");
    const userId = user.email || user.id;
    if (!userId) return;

    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId, reminder, id }),
    });
  } catch (err) {
    console.error("Failed to sync reminder to backend:", err);
  }
};

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],
      
      addReminder: (reminder) => {
        set((state) => ({ reminders: [...state.reminders, reminder] }));
        syncReminderToBackend("upsert", reminder);
      },

      removeReminder: (id) => {
        set((state) => ({ reminders: state.reminders.filter(r => r.id !== id) }));
        syncReminderToBackend("delete", undefined, id);
      },

      markCompleted: (id) => {
        set((state) => {
          const newReminders = state.reminders.map(r => 
            r.id === id ? { ...r, completed: true } : r
          );
          const reminder = newReminders.find(r => r.id === id);
          if (reminder) syncReminderToBackend("upsert", reminder);
          return { reminders: newReminders };
        });
      },

      getUpcomingReminders: () => {
        const now = new Date().toISOString();
        return get().reminders
          .filter(r => !r.completed && r.date >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },

      getOverdueReminders: () => {
        const now = new Date().toISOString();
        return get().reminders
          .filter(r => !r.completed && r.date < now)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent overdue first
      },

      pruneOldReminders: () => set((state) => {
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        const filtered = state.reminders.filter(r => {
          const reminderTime = new Date(r.date).getTime();
          if (r.completed) {
            return reminderTime >= oneDayAgo;
          } else {
            return reminderTime >= oneWeekAgo;
          }
        });
        
        if (filtered.length === state.reminders.length) return state;

        // Sync deletions to backend for the pruned ones
        const prunedIds = state.reminders.filter(r => !filtered.includes(r)).map(r => r.id);
        prunedIds.forEach(id => syncReminderToBackend("delete", undefined, id));

        return { reminders: filtered };
      }),

      fetchRemindersFromBackend: async () => {
        try {
          if (typeof window === "undefined") return;
          const user = JSON.parse(localStorage.getItem("bolt_user") || "{}");
          const userId = user.email || user.id;
          if (!userId) return;

          const res = await fetch(`/api/reminders?userId=${encodeURIComponent(userId)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.reminders) {
              set({ reminders: data.reminders });
            }
          }
        } catch (err) {
          console.error("Failed to load backend reminders:", err);
        }
      },
    }),
    {
      name: "bolt-crm-reminders",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
