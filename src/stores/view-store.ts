import { create } from 'zustand';
import { persist } from "zustand/middleware";

export type FilterCondition = {
  field: string;
  condition: string;
  value: string;
};

export type View = {
  id: string;
  name: string;
  columns: string[];
  filters: FilterCondition[];
  matchType: "all" | "any";
  lockedColumns: string[];
  backendFilterPayload?: any;
  referrer?: string;
};

interface ViewState {
  views: View[];
  activeViewId: string;
  
  // Ephemeral state for the drawers
  isCustomizeColumnsOpen: boolean;
  isFilterDrawerOpen: boolean;

  setCustomizeColumnsOpen: (open: boolean) => void;
  setFilterDrawerOpen: (open: boolean) => void;

  createView: (name: string, backendFilterPayload?: any, referrer?: string) => void;
  syncBackendViews: (backendViews: any[], referrer: string) => void;
  setActiveView: (id: string) => void;
  updateActiveViewColumns: (columns: string[]) => void;
  updateActiveViewFilters: (filters: FilterCondition[], matchType: "all" | "any") => void;
  toggleLockedColumn: (columnId: string) => void;
  removeView: (id: string) => void;
}

export const DEFAULT_COLUMNS = [
  "lead_type",
  "registered_name",
  "registered_email",
  "registered_mobile",
  "form_title",
  "stage_name",
  "sub_stage_name"
];

const DEFAULT_VIEW: View = {
  id: 'default',
  name: 'Default Filter View',
  columns: DEFAULT_COLUMNS,
  filters: [],
  matchType: "all",
  lockedColumns: ['lead_type', 'registered_name'],
};

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      views: [DEFAULT_VIEW],
      activeViewId: 'default',
      isCustomizeColumnsOpen: false,
      isFilterDrawerOpen: false,

      setCustomizeColumnsOpen: (open) => set({ isCustomizeColumnsOpen: open }),
      setFilterDrawerOpen: (open) => set({ isFilterDrawerOpen: open }),

      createView: (name, backendFilterPayload, referrer) => set((state) => {
        const newView: View = {
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          columns: DEFAULT_COLUMNS,
          filters: [],
          matchType: "all",
          lockedColumns: [],
          backendFilterPayload,
          referrer
        };
        return { 
          views: [...state.views, newView],
          activeViewId: newView.id
        };
      }),

      syncBackendViews: (backendViews, referrer) => set((state) => {
        const updatedViews = [...state.views];
        backendViews.forEach(bv => {
          const id = bv.name.toLowerCase().replace(/\s+/g, '-');
          let payload = {};
          try {
            // Parse advanceFilter which is stored as a stringified JSON inside filter_json
            payload = {
              advanceFilter: JSON.parse(bv.filter_json.advanceFilter || "[]"),
              filterCondition: bv.filter_json.filterCondition || "AND"
            };
          } catch(_e) {
            payload = bv.filter_json;
          }

          const existingIdx = updatedViews.findIndex(v => v.id === id);
          if (existingIdx >= 0) {
            updatedViews[existingIdx] = { ...updatedViews[existingIdx], backendFilterPayload: payload, referrer };
          } else {
            updatedViews.push({
              id,
              name: bv.name,
              columns: DEFAULT_COLUMNS,
              filters: [],
              matchType: "all",
              lockedColumns: [],
              backendFilterPayload: payload,
              referrer
            });
          }
        });
        return { views: updatedViews };
      }),

      setActiveView: (id) => set({ activeViewId: id }),

      updateActiveViewColumns: (columns) => set((state) => ({
        views: state.views.map(v => v.id === state.activeViewId ? { ...v, columns } : v)
      })),

      updateActiveViewFilters: (filters, matchType) => set((state) => ({
        views: state.views.map(v => v.id === state.activeViewId ? { ...v, filters, matchType } : v)
      })),

      toggleLockedColumn: (columnId) => set((state) => ({
        views: state.views.map(v => {
          if (v.id !== state.activeViewId) return v;
          const colIndex = v.columns.indexOf(columnId);
          if (colIndex === -1) return v;
          
          const locked = v.lockedColumns || [];
          const isLastLocked = locked.length === colIndex + 1 && locked[colIndex] === columnId;
          
          return {
            ...v,
            lockedColumns: isLastLocked
              ? v.columns.slice(0, colIndex)
              : v.columns.slice(0, colIndex + 1),
          };
        })
      })),

      removeView: (id) => set((state) => {
        const nextViews = state.views.filter(v => v.id !== id);
        return {
          views: nextViews,
          activeViewId: state.activeViewId === id ? 'default' : state.activeViewId
        };
      }),
    }),
    {
      name: "bolt-crm-views-v2",
      partialize: (state) => ({ views: state.views, activeViewId: state.activeViewId }),
    }
  )
);
