"use client";

import { useSubscriptionStore } from "@/stores/subscription-store";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export function SubscriptionBanner() {
  const { status, daysLeft, expiresAt } = useSubscriptionStore();
  const [dismissed, setDismissed] = useState(false);

  // Only render the banner when subscription is active but expiring soon (≤5 days)
  if (status !== "active" || daysLeft > 5 || daysLeft <= 0 || dismissed) {
    return null;
  }

  const isUrgent = daysLeft <= 2;
  const expiryLabel = expiresAt
    ? format(new Date(expiresAt), "d MMM yyyy")
    : null;

  return (
    <div
      className={`
        flex items-center justify-between gap-4 px-4 md:px-6 py-2.5 text-[13px] font-medium shrink-0
        ${
          isUrgent
            ? "bg-red-500/10 border-b border-red-500/15 text-red-400"
            : "bg-amber-500/10 border-b border-amber-500/15 text-amber-400"
        }
      `}
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangle size={14} className="shrink-0" />
        <span className="truncate">
          {isUrgent ? "⚠ Urgent — " : ""}
          Your subscription expires{" "}
          {expiryLabel ? (
            <>
              on <strong>{expiryLabel}</strong>{" "}
            </>
          ) : (
            <>
              in <strong>{daysLeft} {daysLeft === 1 ? "day" : "days"}</strong>{" "}
            </>
          )}
          —{" "}
          <Link
            href="/billing"
            className="underline underline-offset-2 hover:opacity-80 transition-opacity font-semibold"
          >
            Renew now →
          </Link>
        </span>
      </div>

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity p-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}
