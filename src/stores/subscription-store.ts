import { create } from "zustand";

export interface SubscriptionState {
  status: "active" | "inactive" | "loading";
  daysLeft: number;
  expiresAt: string | null;
  setSubscription: (data: {
    status: "active" | "inactive";
    daysLeft: number;
    expiresAt: string | null;
  }) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  status: "loading",
  daysLeft: 0,
  expiresAt: null,
  setSubscription: (data) => set(data),
  reset: () => set({ status: "loading", daysLeft: 0, expiresAt: null }),
}));
