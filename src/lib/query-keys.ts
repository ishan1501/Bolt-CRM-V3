export const queryKeys = {
  leads: (page: number, limit: number) => ["leads", page, limit] as const,
  stages: () => ["stages"] as const,
  profile: (uuid: string) => ["profile", uuid] as const,
  notes: (uuid: string) => ["notes", uuid] as const,
  timeline: (uuid: string) => ["timeline", uuid] as const,
  dashboardOverview: () => ["dashboard", "overview"] as const,
  leadingChannels: () => ["dashboard", "channels"] as const,
};
