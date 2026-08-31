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
    <div className="flex flex-col md:flex-row md:items-center justify-between w-full px-4 md:px-6 py-5 gap-0 md:gap-0">
      {steps.map((step, i) => (
        <div key={i} className={cn("flex flex-col md:flex-row", i < steps.length - 1 ? "md:flex-1" : "")}>
          <div className="flex items-center gap-3 md:gap-2 whitespace-nowrap shrink-0">
            {step.active ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                <Check size={12} className="w-3 h-3" strokeWidth={3} />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full surface-3 flex items-center justify-center border border-[var(--bolt-border-color)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--bolt-text-tertiary)]" />
              </div>
            )}
            <span
              className={cn(
                "text-[13px] md:text-xs font-medium",
                step.active ? "text-emerald-500" : "text-[var(--bolt-text-secondary)]"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <>
              {/* Desktop horizontal line */}
              <div className="hidden md:block flex-1 h-[1px] mx-2 xl:mx-4 bg-[var(--bolt-border-color)] min-w-[12px] self-center" />
              {/* Mobile vertical line */}
              <div className="md:hidden w-[1px] h-5 my-1 ml-[9px] bg-[var(--bolt-border-color)]" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
