import { ORG_ID, SCHOOL_ID, SCHOOL_UUID, MANAGER_TYPE } from "./constants";
import {
  Lead,
  LeadStage,
  ChangeStagePayload,
  LeadProfile,
  Note,
  TimelineEvent,
  PaginatedResponse,
  DashboardOverview,
  LeadingChannels,
} from "@/types/crm";
import { useDebugStore } from "@/stores/debug-store";

/**
 * All API calls go through /api/proxy/... which is our Next.js route handler.
 * This eliminates CORS issues and keeps the Bearer token off the browser's
 * direct requests to the external origin.
 */


function getAuthToken(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("bolt_auth_token") || "";
  }
  return process.env.NEXT_PUBLIC_AUTH_TOKEN || "";
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const url = `/api/proxy${endpoint}`;

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") {
        useDebugStore.getState().addLog("error", "API", "401 Unauthorized", { url });
        localStorage.removeItem("bolt_auth_token");
        localStorage.removeItem("bolt_user");
        window.location.href = "/login";
        throw new Error("Session expired");
      }

      let errorMessage = "API request failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText;
      }
      
      useDebugStore.getState().addLog("error", "API", errorMessage, { url, status: response.status });
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Log success, but truncate huge arrays to save memory
    let debugData = data;
    if (data && data.data && Array.isArray(data.data.result)) {
      debugData = { ...data, data: { ...data.data, result: `[Array of ${data.data.result.length} items omitted for memory]` } };
    }
    useDebugStore.getState().addLog("api", "API_SUCCESS", `Fetched ${endpoint}`, debugData);
    
    return data;
  } catch (error: any) {
    useDebugStore.getState().addLog("error", "API", `Fetch Failed: ${endpoint}`, { error: error.message });
    throw error;
  }
}

export const crmApi = {
  // ── Authentication ────────────────────────────────────────────────────
  login: async (email: string, password: string): Promise<any> => {
    // Login goes directly to the backend (not through the proxy) so the
    // proxy doesn't need to be up before the first call.
    const res = await fetch("/api/proxy/api/users/auth/adminLoginV2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        rememberMe: true,
        timezone: "Asia/Calcutta",
        location: { latitude: 28.505, longitude: 77.087, accuracy: 35 },
      }),
    });

    if (!res.ok) {
      let msg = "Login failed";
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch {}
      throw new Error(msg);
    }

    return res.json();
  },

  // ── Dashboard ─────────────────────────────────────────────────────────
  fetchDashboardOverview: async (): Promise<DashboardOverview> => {
    return fetchApi<DashboardOverview>(
      `/api/v2/org/${ORG_ID}/dashboard-v2/overview?schoolId=${SCHOOL_UUID}&timezone=Asia%2FCalcutta`
    );
  },

  fetchLeadingChannels: async (): Promise<LeadingChannels> => {
    return fetchApi<LeadingChannels>(
      `/api/v2/org/${ORG_ID}/dashboard-v2/leading-channels?schoolId=${SCHOOL_UUID}&timezone=Asia%2FCalcutta`
    );
  },

  // ── Leads ─────────────────────────────────────────────────────────────
  fetchLeads: async (page = 1, limit = 50): Promise<PaginatedResponse<Lead>> => {
    return fetchApi<PaginatedResponse<Lead>>(
      `/api/v2/org/manage-leads/fetchAllApplicationLeads?page=${page}&limit=${limit}&schoolId=${SCHOOL_UUID}`,
      { method: "POST", body: JSON.stringify({}) }
    );
  },

  /** Fetches ALL applications by auto-paginating through every page */
  fetchAllApplications: async (): Promise<Lead[]> => {
    const PAGE_SIZE = 250;
    let page = 1;
    let allApps: Lead[] = [];
    let total = Infinity;

    while (allApps.length < total) {
      const res = await fetchApi<any>(
        `/api/v2/org/manage-leads/fetchAllApplicationLeads?page=${page}&limit=${PAGE_SIZE}&schoolId=${SCHOOL_UUID}`,
        { method: "POST", body: JSON.stringify({}) }
      );

      const apps: Lead[] = Array.isArray(res?.data) ? res.data : (res?.data?.result ?? res?.result ?? []);
      const resTotal: number = res?.pagination?.total ?? res?.data?.pagination?.total ?? res?.data?.total ?? res?.total ?? 0;

      if (resTotal > 0) total = resTotal;
      allApps = [...allApps, ...apps];

      if (apps.length === 0) break;
      if (allApps.length >= total) break;
      page++;
    }

    return allApps;
  },

  fetchSavedViews: async (): Promise<any[]> => {
    try {
      const res = await fetchApi<any>(`/api/savedFilter?referrer=manageLeads`);
      return res?.data?.savedFilters || [];
    } catch (e) {
      console.error("Failed to fetch saved views", e);
      return [];
    }
  },

  /** Fetches ALL leads by auto-paginating through every page */
  fetchAllLeads: async (filterPayload?: any): Promise<Lead[]> => {
    const PAGE_SIZE = 250;
    let page = 1;
    let allLeads: Lead[] = [];
    let total = Infinity;

    while (allLeads.length < total) {
      const bodyPayload = filterPayload ? { ...filterPayload } : {};
      
      const res = await fetchApi<any>(
        `/api/v2/org/manage-leads/fetchAllLeads?page=${page}&limit=${PAGE_SIZE}&schoolId=${SCHOOL_UUID}`,
        { method: "POST", body: JSON.stringify(bodyPayload) }
      );

      // Extract leads from response (handle multiple shapes)
      const leads: Lead[] = Array.isArray(res?.data) ? res.data : (res?.data?.result ?? res?.result ?? []);
      
      const resTotal: number =
        res?.pagination?.total ?? res?.data?.pagination?.total ?? res?.data?.total ?? res?.total ?? 0;

      if (resTotal > 0) total = resTotal;
      allLeads = [...allLeads, ...leads];

      // Safe exit if the server returns 0 items to prevent infinite loop
      if (leads.length === 0) break;
      
      // Keep fetching until we hit the total requested by the server
      if (allLeads.length >= total) break;
      
      page++;
    }

    return allLeads;
  },

  fetchStages: async (): Promise<LeadStage[]> => {
    // V2 API returns stages in `.data.foundLeadStages`
    const res = await fetchApi<any>(
      `/api/users/leads/getLeadStagesWithSubStages?organizationId=${ORG_ID}&managerType=${MANAGER_TYPE}&schoolId=${SCHOOL_ID}`
    );
    return res?.data?.foundLeadStages || [];
  },

  changeLeadStage: async (
    leadUuids: string[],
    stage: LeadStage
  ): Promise<{ success: boolean; data: { jobId: string } }> => {
    const payload: ChangeStagePayload = {
      user: {},
      stagePayload: {
        manageLeadData: leadUuids.map((id) => ({ manageLeadId: id })),
        leadStage: {
          ...stage,
          followUpRequired: false,
          isActive: true,
          applicableTo: "Lead",
          label: stage.stageName,
          value: stage.uuid,
          name: "leadStage",
        },
        leadSubStage: stage.LeadSubStages?.[0] ? {
          ...stage.LeadSubStages[0],
          label: stage.LeadSubStages[0].subStageName || stage.LeadSubStages[0].name || (stage.LeadSubStages[0] as any).stageName || (stage.LeadSubStages[0] as any).sub_stage_name,
          value: stage.LeadSubStages[0].uuid,
          name: "leadSubStage",
        } : null,
        subject: "",
        fromDate: new Date().toISOString(),
        toDate: "",
        timezone: "Asia/Calcutta",
        owner: "",
        organizer: 4546495,
        description: "",
        noteMessage: "",
        addEventInCalendar: false,
        isSelectAllData: false,
        managerType: MANAGER_TYPE,
        filterPayload: {
          schoolUuid: null,
          filteredData: {
            globalCondition: "All",
            advanceFilter: [{ fields: "", condition: "", type: "STRING", values: "" }],
          },
          searchFilters: {},
          schoolId: SCHOOL_ID,
        },
      },
    };

    return fetchApi<{ success: boolean; data: { jobId: string } }>(
      `/api/org/${ORG_ID}/leads/changeLeadStage`,
      { method: "POST", body: JSON.stringify(payload) }
    );
  },

  pollBulkJob: async (jobId: string): Promise<any> => {
    return fetchApi(`/api/v2/org/${ORG_ID}/leads/bulk-jobs/${jobId}`);
  },

  // ── Lead Detail ───────────────────────────────────────────────────────
  fetchLeadProfile: async (uuid: string): Promise<LeadProfile> => {
    return fetchApi<LeadProfile>(
      `/api/v2/org/${ORG_ID}/profile/student/${uuid}?referrer=leadManager`
    );
  },

  // ── Notes ─────────────────────────────────────────────────────────────
  fetchNotes: async (uuid: string): Promise<Note[]> => {
    return fetchApi<Note[]>(`/api/user/getNotes/${uuid}`);
  },

  createNote: async (uuid: string, message: string): Promise<any> => {
    return fetchApi(`/api/user/createNotes/${uuid}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  // ── Timeline ──────────────────────────────────────────────────────────
  fetchTimeline: async (uuid: string): Promise<TimelineEvent[]> => {
    return fetchApi<TimelineEvent[]>(
      `/api/v2/org/masters-union/leads/${uuid}/timeline`
    );
  },
};
