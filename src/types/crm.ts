// ── Paginated Response ──────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    result: T[];
    total: number;
    page: number;
    limit: number;
  };
}

// ── Leads ────────────────────────────────────────────────────────────────

export interface Lead {
  id: number;
  uuid: string;
  registered_name: string;
  registered_email: string;
  registered_mobile: string;
  stage_name: string;
  sub_stage_name: string;
  form_title: string;
  lead_type: string;
  counsellor_name: string;
  number_of_notes: number;
  created_at: string;
  is_edit_access_granted?: boolean;
  is_payment_done?: boolean;
  payment_status?: string;
  previous_lead_stage?: string;
  application_stage_name?: string;
  application_sub_stage_name?: string;
  previous_counsellor?: string;
  reassigned_by?: string;
  school_name?: string;
  tags?: any[];
  [key: string]: any;
}

export interface LeadSubStage {
  uuid: string;
  name?: string;
  subStageName?: string; // API returns this field name
  order?: number;
}

export interface LeadStage {
  uuid: string;
  stageName: string;
  order?: number;
  LeadSubStages?: LeadSubStage[];
  followUpRequired?: boolean;
  isActive?: boolean;
  applicableTo?: string;
  label?: string;
  value?: string;
  name?: string;
}

export interface LeadProfile {
  uuid: string;
  personal_info?: Record<string, unknown>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  application_score?: number;
  employment_info?: Record<string, unknown>;
}

// ── Notes ────────────────────────────────────────────────────────────────

export interface Note {
  id?: number;
  uuid?: string;
  message: string;
  created_at?: string;
  created_by_name?: string;
}

// ── Timeline ─────────────────────────────────────────────────────────────

export interface TimelineEvent {
  uuid: string;
  event_type: string;
  description: string;
  created_at: string;
}

// ── Stage Change Payload ─────────────────────────────────────────────────

export interface ChangeStagePayload {
  user: Record<string, unknown>;
  stagePayload: {
    manageLeadData: { manageLeadId: string }[];
    leadStage: LeadStage;
    leadSubStage?: any;
    subject: string;
    fromDate: string;
    toDate: string;
    timezone: string;
    owner: string;
    organizer: number;
    description: string;
    noteMessage: string;
    addEventInCalendar: boolean;
    isSelectAllData: boolean;
    managerType: string;
    filterPayload: {
      schoolUuid: string | null;
      filteredData: {
        globalCondition: string;
        advanceFilter: { fields: string; condition: string; type: string; values: string }[];
      };
      searchFilters: Record<string, unknown>;
      schoolId: number;
    };
  };
}

export interface BulkJobStatus {
  status: "pending" | "processing" | "completed" | "failed";
  total: number;
  processed: number;
  failed: number;
}

// ── Dashboard ────────────────────────────────────────────────────────────

export interface DashboardOverview {
  success?: boolean;
  data?: {
    totalLeads?: number;
    applicationsStarted?: number;
    unpaidApplications?: number;
    paidApplications?: number;
    verifiedLeads?: number;
    unverifiedLeads?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ChannelData {
  name: string;
  count: number;
  [key: string]: unknown;
}

export interface LeadingChannels {
  success?: boolean;
  data?: ChannelData[] | { channels?: ChannelData[]; [key: string]: unknown };
  [key: string]: unknown;
}

// ── Reminders (local) ────────────────────────────────────────────────────

export interface Reminder {
  id: string;
  leadUuid: string;
  leadName: string;
  title: string;
  date: string; // ISO string
  completed: boolean;
}

// ── Auth ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  id?: number;
  uuid?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}
