"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { setSubscription } = useSubscriptionStore();

  useEffect(() => {
    const init = async () => {
      try {
        // ── 1. Auth check ─────────────────────────────────────────────
        const token = localStorage.getItem("bolt_auth_token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        // ── 2. Extract user email from stored profile ──────────────────
        const raw = localStorage.getItem("bolt_user");
        const user = raw ? JSON.parse(raw) : {};
        const email =
          user?.email || user?.admin_email || user?.username || user?.registered_email || "";

        // If we can't determine email, allow access (don't block on a missing field)
        if (!email) {
          setIsReady(true);
          return;
        }

        // ── 3. Subscription gate ──────────────────────────────────────
        const res = await fetch(
          `/api/subscription/status?email=${encodeURIComponent(email)}`
        );
        const data = await res.json();

        if (data.status !== "active") {
          router.push("/billing");
          return;
        }

        // ── 4. Hydrate global store (used by the renewal banner) ──────
        setSubscription({
          status: "active",
          daysLeft: data.daysLeft ?? 0,
          expiresAt: data.expiresAt ?? null,
        });

        setIsReady(true);
      } catch {
        // If the subscription API fails (e.g. Supabase table not set up yet),
        // fall through to the CRM rather than locking everyone out.
        setIsReady(true);
      }
    };

    init();
  }, [router, setSubscription]);

  // Show a loading screen while auth + subscription check is running
  if (!isReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--bolt-accent)] animate-spin" />
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
