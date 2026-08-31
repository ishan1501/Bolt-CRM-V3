import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadProgressProps {
  profile: Record<string, any>;
}

export function LeadProgress({ profile }: LeadProgressProps) {
  // Try to extract boolean flags for these stages from the raw profile
  // Fallback to true/false for demo purposes if not found, to match the visual
  const raw = profile.raw || {};
  
  // Use the extracted fields which we now know return "Yes" / "No"
  // Default to sensible fallbacks if missing
  const isYes = (val: any) => typeof val === "string" ? val.toLowerCase() === "yes" : !!val;
  
  const appStarted = isYes(profile.applicationInitiated) || isYes(raw.applicationStarted);
  const appSubmitted = isYes(profile.applicationSubmitted) || isYes(raw.applicationSubmitted);
  const payment = isYes(profile.paymentDone) || isYes(raw.paymentApproved);
  
  // Unverified/Verified logic (fallback to true/false if no explicit fields exist)
  const verified = isYes(raw.isVerified) || isYes(raw.verified);
  const unverified = !verified;

  const steps = [
    { label: "Unverified", active: unverified },
    { label: "Verified", active: verified },
    { label: "Application Started", active: appStarted },
    { label: "Payment Approved", active: payment },
    { label: "Application Submitted", active: appSubmitted },
  ];

  return (
    <div className="flex items-center justify-between w-full px-4 md:px-6 py-5 overflow-x-auto xl:overflow-visible hide-scrollbar">
      {steps.map((step, i) => (
        <div key={i} className={cn("flex items-center", i < steps.length - 1 ? "flex-1" : "")}>
          <div className="flex items-center gap-1.5 md:gap-2 whitespace-nowrap shrink-0">
            {step.active ? (
              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                <Check size={12} className="w-2.5 h-2.5 md:w-3 md:h-3" strokeWidth={3} />
              </div>
            ) : (
              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full surface-3 flex items-center justify-center border border-[var(--bolt-border-color)]">
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[var(--bolt-text-tertiary)]" />
              </div>
            )}
            <span
              className={cn(
                "text-[11px] xl:text-xs font-medium",
                step.active ? "text-emerald-500" : "text-[var(--bolt-text-secondary)]"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-[1px] mx-2 xl:mx-4 bg-[var(--bolt-border-color)] min-w-[12px]" />
          )}
        </div>
      ))}
    </div>
  );
}
