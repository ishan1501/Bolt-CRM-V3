"use client";

import { useLeadProfile } from "@/hooks/use-lead-profile";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { ReactNode } from "react";

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "dd MMM yyyy, hh:mm a");
  } catch {
    return dateStr;
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="surface-2 shadow-sm border border-[var(--bolt-border-color)] rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--bolt-border-color)] surface-3">
        <h3 className="font-semibold text-[var(--bolt-text-primary)]">{title}</h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, fullWidth = false }: { label: string; value: any; fullWidth?: boolean }) {
  const displayValue = value === true ? "Yes" : value === false ? "No" : value || "-";
  return (
    <div className={fullWidth ? "col-span-1 md:col-span-2" : ""}>
      <div className="text-[11px] font-semibold text-[var(--bolt-text-secondary)] mb-1 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-medium break-all text-[var(--bolt-text-primary)]">{String(displayValue)}</div>
    </div>
  );
}

export function ProfileTab({ uuid }: { uuid: string }) {
  const { profile, isLoading, error } = useLeadProfile(uuid);

  if (isLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
  if (error) return <div className="text-red-500 text-sm">Failed to load profile details.</div>;
  if (!profile) return <div className="text-center p-8 text-[var(--bolt-text-secondary)] text-sm">No profile data available.</div>;

  return (
    <div className="space-y-6">
      
      <Section title="Lead Information">
        <Field label="Registered Name" value={profile.name} />
        <Field label="Email" value={profile.email} />
        <Field label="Mobile Number" value={profile.mobile} />
        <Field label="Country Code" value={profile.countryCode} />
        <Field label="Status" value={profile.status} />
        <Field label="Source" value={profile.source} />
        <Field label="Medium" value={profile.medium} fullWidth />
        <Field label="Campaign" value={profile.campaign} fullWidth />
        <Field label="Lead Origin" value={profile.leadOrigin} />
        <Field label="Country" value={profile.country} />
        <Field label="Country Code (ISO)" value={profile.countryCodeIso} />
        <Field label="Registered On" value={formatDate(profile.createdAt)} />
        <Field label="Form Completion" value={profile.formCompletion} />
        <Field label="Application Initiated" value={profile.applicationInitiated} />
        <Field label="Application Submitted" value={profile.applicationSubmitted} />
        <Field label="Payment Done" value={profile.paymentDone} />
        <Field label="Edit Access Granted" value={profile.editAccessGranted} />
      </Section>

      <Section title="Attribution & Tracking">
        <Field label="FBCLID" value={profile.fbclid} fullWidth />
        <Field label="UTM Term" value={profile.utmTerm} fullWidth />
        <Field label="UTM Content" value={profile.utmContent} fullWidth />
      </Section>

      <Section title="Personal Information">
        <Field label="Date of Birth" value={formatDate(profile.dob)} />
        <Field label="Gender" value={profile.gender} />
        <Field label="Pin Code" value={profile.pinCode} />
      </Section>

      <Section title="Additional Details">
        <Field label="House Flat No" value={profile.houseFlatNo} fullWidth />
        <Field label="Apartment Road Area" value={profile.apartmentRoadArea} fullWidth />
        <Field label="Landmark" value={profile.landmark} fullWidth />
        <Field label="Is Permanent Address" value={profile.isPermanentAddress} />
        <Field label="Emp Details Company1" value={profile.empDetailsCompany1} fullWidth />
        <Field label="Emp Details Desig1" value={profile.empDetailsDesig1} fullWidth />
        <Field label="Emp Details Salary1" value={profile.empDetailsSalary1} />
        <Field label="Emp Details Total Exp1" value={profile.empDetailsTotalExp1} />
        <Field label="Your Total Work Exp" value={profile.yourTotalWorkExp} />
        <Field label="Interviewee Declaration Accepted" value={profile.intervieweeDeclarationAccepted} fullWidth />
      </Section>

    </div>
  );
}
