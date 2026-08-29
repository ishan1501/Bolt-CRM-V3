import { useQuery } from "@tanstack/react-query";
import { crmApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useMemo } from "react";

export function extractProfileData(raw: unknown): Record<string, any> {
  if (!raw) return {};
  const r = raw as Record<string, any>;
  const base = r.data || r;
  const student = base.studentData || base.student || base.leadData || base.lead || base;
  if (student && typeof student === "object" && !Array.isArray(student)) {
    return student;
  }
  return base;
}

export function useLeadProfile(uuid: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.profile(uuid!),
    queryFn: () => crmApi.fetchLeadProfile(uuid!),
    enabled: !!uuid,
  });

  const profile = useMemo(() => {
    if (!data) return null;
    let p = data as any;
    
    // Unpack from common CRM payload shapes
    if (p.data) p = p.data;
    if (p.studentData) p = p.studentData;
    if (p.user) p = { ...p, ...p.user };
    
    // Merge nested tables safely: never let an empty string or null overwrite a valid value
    const leadData = p.leadData || {};
    const orgData = p.orgTableData || {};
    
    const merged = { ...p };
    const mergeSafe = (sourceObj: any) => {
      Object.entries(sourceObj).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") {
          merged[k] = v;
        }
      });
    };
    mergeSafe(leadData);
    mergeSafe(orgData);

    // Helper to safely extract first non-null/undefined/empty value to preserve false and 0
    const getVal = (...keys: string[]) => {
      // 1. Check top-level merged object
      for (const k of keys) {
        if (merged[k] !== undefined && merged[k] !== null && merged[k] !== "") return merged[k];
      }
      
      // 2. Deep search the original payload
      let found: any = "";
      
      const search = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        
        // Check if it's a key-value object pair like { label: "dob", value: "..." }
        const keyProps = ["key", "name", "field", "label", "id"];
        const valProps = ["value", "val", "answer"];
        
        for (const kProp of keyProps) {
          for (const vProp of valProps) {
            if (obj[kProp] && typeof obj[kProp] === "string") {
              const objKeyStr = String(obj[kProp]).toLowerCase().replace(/[^a-z0-9]/g, "");
              for (const k of keys) {
                const targetKeyStr = k.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (objKeyStr === targetKeyStr) {
                  if (obj[vProp] !== undefined && obj[vProp] !== null && obj[vProp] !== "") {
                    found = obj[vProp];
                    return;
                  }
                }
              }
            }
          }
        }

        // Normal object traversal with case-insensitive / normalized key check
        for (const [objKey, objVal] of Object.entries(obj)) {
          const objKeyStr = objKey.toLowerCase().replace(/[^a-z0-9]/g, "");
          for (const k of keys) {
            const targetKeyStr = k.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (objKeyStr === targetKeyStr) {
              if (objVal !== undefined && objVal !== null && objVal !== "") {
                found = objVal;
                return;
              }
            }
          }
        }

        for (const val of Object.values(obj)) {
          if (found !== "") return;
          if (typeof val === "object") search(val);
        }
      };
      
      search(p);
      return found;
    };

    return {
      id: getVal("uuid", "id"),
      name: getVal("name", "registeredName", "applicantName") || `${getVal("firstName", "first_name") || ""} ${getVal("lastName", "last_name") || ""}`.trim(),
      email: getVal("email", "registeredEmail"),
      mobile: getVal("mobileNumber", "registeredMobile", "mobile"),
      countryCode: getVal("countryCode", "country_code"),
      
      stageName: getVal("stageName", "stage_name") || merged.leadStageData?.stageName || "",
      subStageName: getVal("subStageName", "sub_stage_name") || merged.leadSubStageData?.subStageName || merged.leadSubStageData?.stageName || "NOT SET",

      formTitle: getVal("form_title", "formTitle") || merged.programData?.name || "",
      leadType: getVal("lead_type", "leadType"),
      counsellor: getVal("counsellor_name", "counsellorName") || merged.assignedCounsellorData?.name || "",
      source: getVal("utm_source", "utmSource", "source"),
      medium: getVal("utm_medium", "utmMedium", "medium"),
      campaign: getVal("utm_campaign", "utmCampaign", "campaign"),
      leadOrigin: getVal("lead_origin", "leadOrigin", "origin"),
      country: getVal("country", "leadCountry"),
      countryCodeIso: getVal("countryCodeIso", "country_code_iso", "isoCode"),
      status: getVal("status"),
      createdAt: getVal("created_at", "createdAt", "capturedOn", "registeredOn"),
      lastActivity: getVal("last_activity_at", "lastActivityAt", "updatedAt", "updated_at", "lastActiveAt"),
      leadScore: getVal("lead_score", "leadScore", "score", "applicationScore", "0"),
      applicationStatus: getVal("application_status", "applicationStatus", "100%"),
      communicationStatus: getVal("communication_status", "communicationStatus", "emailSent", "Email Sent: 0"),
      
      // New extended fields requested by user
      formCompletion: getVal("formCompletion", "form_completion", "formPercentageFilled", "completion"),
      applicationInitiated: getVal("applicationInitiated", "application_initiated", "applicationFormInitiated"),
      applicationSubmitted: getVal("applicationSubmitted", "application_submitted", "applicationFormSubmitted"),
      paymentDone: getVal("paymentDone", "payment_done", "isPaymentDone"),
      editAccessGranted: getVal("editAccessGranted", "edit_access_granted", "isEditAccessGranted"),
      
      fbclid: getVal("fbclid", "fb_clid"),
      utmTerm: getVal("utmTerm", "utm_term"),
      utmContent: getVal("utmContent", "utm_content"),
      
      dob: getVal("dob", "dateOfBirth", "date_of_birth"),
      gender: getVal("gender"),
      pinCode: getVal("pinCode", "pincode", "pin_code"),
      
      houseFlatNo: getVal("houseFlatNo", "house_flat_no", "addressLine1"),
      apartmentRoadArea: getVal("apartmentRoadArea", "apartment_road_area", "addressLine2"),
      landmark: getVal("landmark"),
      isPermanentAddress: getVal("isPermanentAddress", "is_permanent_address"),
      
      empDetailsCompany1: getVal("empDetailsCompany1", "emp_details_company1", "company"),
      empDetailsDesig1: getVal("empDetailsDesig1", "emp_details_desig1", "designation"),
      empDetailsSalary1: getVal("empDetailsSalary1", "emp_details_salary1", "salary"),
      empDetailsTotalExp1: getVal("empDetailsTotalExp1", "emp_details_total_exp1", "experience"),
      yourTotalWorkExp: getVal("yourTotalWorkExp", "your_total_work_exp", "totalExperience"),
      intervieweeDeclarationAccepted: getVal("intervieweeDeclarationAccepted", "interviewee_declaration_accepted"),

      raw: p,
    };
  }, [data]);

  return { profile, rawProfile: data, isLoading, error };
}
