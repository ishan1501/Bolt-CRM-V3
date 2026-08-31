import { Lead } from "@/types/crm";
import { create } from "zustand";

type DrawerTab = "profile" | "notes" | "history" | "reminders" | "email" | "whatsapp";

interface UIState {
  selectedLeadIds: Set<string>;
  drawerOpen: boolean;
  activeLeadUuid: string | null;
  drawerTab: DrawerTab;
  currentLeadList: Lead[];
  searchQuery: string;
  settingsOpen: boolean;
  
  toggleLeadSelection: (uuid: string) => void;
  selectAllLeads: (uuids: string[]) => void;
  clearSelection: () => void;
  
  openDrawer: (uuid: string, tab?: DrawerTab) => void;
  closeDrawer: () => void;
  setDrawerTab: (tab: DrawerTab) => void;
  
  setCurrentLeadList: (leads: Lead[]) => void;
  setSearchQuery: (query: string) => void;
  
  programFilters: string[];
  stageFilters: string[];
  toggleProgramFilter: (program: string) => void;
  toggleStageFilter: (stage: string) => void;
  clearProgramFilters: () => void;
  clearStageFilters: () => void;

  setSettingsOpen: (open: boolean) => void;

  sidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;

  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedLeadIds: new Set(),
  drawerOpen: false,
  settingsOpen: false,
  activeLeadUuid: null,
  drawerTab: "profile",
  currentLeadList: [],
  searchQuery: "",
  setCurrentLeadList: (leads) => set({ currentLeadList: leads }),
  sidebarExpanded: false,
  mobileDrawerOpen: false,

  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),

  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  setSidebarExpanded: (expanded: boolean) => set({ sidebarExpanded: expanded }),

  toggleLeadSelection: (uuid) => set((state) => {
    const newSelection = new Set<string>(state.selectedLeadIds);
    if (newSelection.has(uuid)) {
      newSelection.delete(uuid);
    } else {
      newSelection.add(uuid);
    }
    return { selectedLeadIds: newSelection };
  }),

  selectAllLeads: (uuids) => set({ selectedLeadIds: new Set<string>(uuids) }),

  clearSelection: () => set({ selectedLeadIds: new Set() }),

  openDrawer: (uuid, tab?) => set((state) => ({
    drawerOpen: true,
    activeLeadUuid: uuid,
    // If no tab is specified OR if we're opening a DIFFERENT lead, always go to profile
    drawerTab: tab ?? (state.activeLeadUuid !== uuid ? "profile" : state.drawerTab),
  })),
  
  closeDrawer: () => {
    set({ drawerOpen: false, drawerTab: "profile" });
    setTimeout(() => {
      set((state) => {
        if (!state.drawerOpen) {
          return { activeLeadUuid: null };
        }
        return state;
      });
    }, 300);
  },
  setDrawerTab: (tab) => set({ drawerTab: tab }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  programFilters: [],
  stageFilters: [],
  toggleProgramFilter: (program) => set((state) => {
    const filters = state.programFilters.includes(program)
      ? state.programFilters.filter(p => p !== program)
      : [...state.programFilters, program];
    return { programFilters: filters };
  }),
  toggleStageFilter: (stage) => set((state) => {
    const filters = state.stageFilters.includes(stage)
      ? state.stageFilters.filter(s => s !== stage)
      : [...state.stageFilters, stage];
    return { stageFilters: filters };
  }),
  clearProgramFilters: () => set({ programFilters: [] }),
  clearStageFilters: () => set({ stageFilters: [] }),

  setSettingsOpen: (open) => set({ settingsOpen: open }),
}));
