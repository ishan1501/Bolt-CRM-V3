"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { LeadDrawer } from "@/components/leads/lead-drawer";
import { ArrowLeft } from "lucide-react";

/**
 * Lead Detail Page — /leads/[uuid]
 *
 * This page auto-opens the LeadDrawer for the given UUID so that navigating
 * directly to /leads/some-uuid shows the full lead profile instead of a 404.
 * The user can click "Back to Leads" to return to the leads list.
 */
export default function LeadDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const router = useRouter();
  const { openDrawer, closeDrawer, drawerOpen } = useUIStore();

  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    if (uuid) {
      openDrawer(uuid);
      setHasOpened(true);
    }
    return () => {
      closeDrawer();
    };
  }, [uuid, openDrawer, closeDrawer]);

  useEffect(() => {
    // If the drawer was opened and then closed while we are still on this page, navigate back
    if (hasOpened && !drawerOpen) {
      router.back();
      // Fallback in case router.back() does nothing (e.g. direct link visit)
      const fallbackTimer = setTimeout(() => {
        if (window.location.pathname.startsWith("/leads/")) {
          router.push("/leads");
        }
      }, 100);
      return () => clearTimeout(fallbackTimer);
    }
  }, [drawerOpen, hasOpened, router]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Back navigation */}
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <button
          onClick={() => router.push("/leads")}
          className="flex items-center gap-2 text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Leads
        </button>
      </div>

      {/* The drawer renders as a panel here */}
      <div className="flex-1 min-h-0">
        <LeadDrawer leads={[]} />
      </div>
    </div>
  );
}
