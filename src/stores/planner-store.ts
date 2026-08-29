import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface PlannerTask {
  id: string; // The UUID from supabase, or local string if optimistic
  text: string;
  done: boolean;
}

interface PlannerState {
  todos: Record<string, Record<string, PlannerTask>>;
  isLoading: boolean;
  fetchTodos: () => Promise<void>;
  addTask: (dateKey: string, text: string) => Promise<void>;
  toggleTask: (dateKey: string, taskId: string) => Promise<void>;
  deleteTask: (dateKey: string, taskId: string) => Promise<void>;
  getTasksForDate: (dateKey: string) => PlannerTask[];
}

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("bolt_user") || "{}");
    return user.email || user.id || "unknown";
  } catch (e) {
    return "unknown";
  }
};

export const usePlannerStore = create<PlannerState>((set, get) => ({
  todos: {},
  isLoading: false,

  fetchTodos: async () => {
    set({ isLoading: true });
    const userId = getUserId();
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId);

    if (!error && data) {
      const groupedTodos: Record<string, Record<string, PlannerTask>> = {};
      
      data.forEach((row: any) => {
        // Group by YYYY-MM-DD from created_at (since planner is daily)
        // Wait, if it's created_at, the task belongs to the day it was created!
        const dateKey = new Date(row.created_at).toISOString().slice(0, 10);
        if (!groupedTodos[dateKey]) groupedTodos[dateKey] = {};
        
        groupedTodos[dateKey][row.id] = {
          id: row.id,
          text: row.task_text,
          done: row.is_done
        };
      });

      set({ todos: groupedTodos, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  addTask: async (dateKey, text) => {
    const id = Date.now().toString(36); // Temp ID for optimistic update
    
    // Optimistic update
    set((state) => {
      const dayTodos = { ...(state.todos[dateKey] || {}) };
      dayTodos[id] = { id, text, done: false };
      return { todos: { ...state.todos, [dateKey]: dayTodos } };
    });

    const userId = getUserId();
    
    // Determine the created_at timestamp so it matches the dateKey
    // (e.g. if we are adding a task for "yesterday", we should set created_at to yesterday)
    // Actually, in the frontend we only add tasks to "today" generally, but just in case:
    const targetDate = new Date(dateKey + "T12:00:00Z").toISOString();

    const { data, error } = await supabase
      .from("todos")
      .insert([
        {
          user_id: userId,
          task_text: text,
          is_done: false,
          created_at: targetDate
        }
      ])
      .select();

    if (data && data.length > 0) {
      const realId = data[0].id;
      set((state) => {
        const dayTodos = { ...(state.todos[dateKey] || {}) };
        if (dayTodos[id]) {
          dayTodos[realId] = { ...dayTodos[id], id: realId };
          delete dayTodos[id];
        }
        return { todos: { ...state.todos, [dateKey]: dayTodos } };
      });
    }
  },

  toggleTask: async (dateKey, taskId) => {
    // Optimistic update
    let newDoneState = false;
    set((state) => {
      const dayTodos = { ...(state.todos[dateKey] || {}) };
      if (dayTodos[taskId]) {
        newDoneState = !dayTodos[taskId].done;
        dayTodos[taskId] = { ...dayTodos[taskId], done: newDoneState };
      }
      return { todos: { ...state.todos, [dateKey]: dayTodos } };
    });

    // If it's a real UUID (length 36)
    if (taskId.length === 36) {
      await supabase
        .from("todos")
        .update({ is_done: newDoneState })
        .eq("id", taskId);
    }
  },

  deleteTask: async (dateKey, taskId) => {
    // Optimistic update
    set((state) => {
      const dayTodos = { ...(state.todos[dateKey] || {}) };
      delete dayTodos[taskId];
      return { todos: { ...state.todos, [dateKey]: dayTodos } };
    });

    if (taskId.length === 36) {
      await supabase
        .from("todos")
        .delete()
        .eq("id", taskId);
    }
  },

  getTasksForDate: (dateKey) => {
    const dayTodos = get().todos[dateKey] || {};
    return Object.values(dayTodos);
  }
}));
