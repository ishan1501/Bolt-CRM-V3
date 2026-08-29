"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    console.log("DashboardLayout useEffect running");
    try {
      const token = localStorage.getItem("bolt_auth_token");
      console.log("Token is:", token ? "exists" : "none");
      if (!token) {
        window.location.href = "/login";
      } else {
        setIsAuthorized(true);
      }
    } catch (e) {
      window.location.href = "/login";
    }
  }, []);

  if (!isAuthorized) {
    return <div className="min-h-screen bg-[var(--background)]" />; // Empty screen while checking auth
  }

  return <AppLayout>{children}</AppLayout>;
}
