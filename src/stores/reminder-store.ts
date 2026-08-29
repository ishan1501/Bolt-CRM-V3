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
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],
      
      addReminder: (reminder) => set((state) => ({
        reminders: [...state.reminders, reminder],
      })),

      removeReminder: (id) => set((state) => ({
        reminders: state.reminders.filter(r => r.id !== id),
      })),

      markCompleted: (id) => set((state) => ({
        reminders: state.reminders.map(r => 
          r.id === id ? { ...r, completed: true } : r
        ),
      })),

      getUpcomingReminders: () => {
        const now = new Date().toISOString();
        return get().reminders
          .filter(r => !r.completed && r.date >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },
    }),
    {
      name: "bolt-crm-reminders",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
