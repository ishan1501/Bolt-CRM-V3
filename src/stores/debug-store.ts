import { create } from "zustand";

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "warn" | "error" | "api";
  source: string;
  message: string;
  details?: any;
}

interface DebugStore {
  logs: LogEntry[];
  addLog: (type: LogEntry["type"], source: string, message: string, details?: any) => void;
  clearLogs: () => void;
}

export const useDebugStore = create<DebugStore>((set) => ({
  logs: [],
  addLog: (type, source, message, details) => {
    set((state) => {
      // Stringify and truncate details to prevent memory bloat
      let safeDetails = details;
      try {
        if (details) {
          const str = typeof details === "string" ? details : JSON.stringify(details);
          safeDetails = str.length > 2000 ? str.substring(0, 2000) + "... [TRUNCATED]" : details;
        }
      } catch (_e) {
        safeDetails = "Unserializable payload";
      }

      const newLog: LogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        type,
        source,
        message,
        details: safeDetails,
      };
      
      // Keep only the last 30 logs in memory
      return { logs: [newLog, ...state.logs].slice(0, 30) };
    });
  },
  clearLogs: () => set({ logs: [] }),
}));
