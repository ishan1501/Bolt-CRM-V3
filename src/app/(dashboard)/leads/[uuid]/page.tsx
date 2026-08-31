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
    // If the drawer was opened and then closed while we are still on this page, navigate to leads table
    if (hasOpened && !drawerOpen) {
      const animationTimer = setTimeout(() => {
        router.push("/leads");
      }, 300); // 300ms matches the Framer Motion exit duration

      return () => clearTimeout(animationTimer);
    }
  }, [drawerOpen, hasOpened, router]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {/* 
        This standalone page just mounts the drawer for direct deep-links.
        We don't need any background UI because the drawer covers the screen
        and handles navigation back to /leads upon closing.
      */}
      <LeadDrawer />
    </div>
  );
}
