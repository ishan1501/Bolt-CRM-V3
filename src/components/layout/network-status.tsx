"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function NetworkStatus() {
  const offlineToastId = useRef<string | number | null>(null);
  const slowToastId = useRef<string | number | null>(null);

  useEffect(() => {
    const checkConnection = () => {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn) {
        if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.effectiveType === '3g') {
          if (!slowToastId.current) {
            slowToastId.current = toast.warning("Slow connection detected. Loading may take longer.", {
              duration: 5000,
            });
          }
        } else {
          if (slowToastId.current) {
            toast.dismiss(slowToastId.current);
            slowToastId.current = null;
          }
        }
      }
    };

    const handleOffline = () => {
      if (!offlineToastId.current) {
        offlineToastId.current = toast.error("You are currently offline. Check your connection.", {
          duration: Infinity,
        });
      }
    };

    const handleOnline = () => {
      if (offlineToastId.current) {
        toast.dismiss(offlineToastId.current);
        offlineToastId.current = null;
        toast.success("Connection restored!");
      }
      checkConnection();
    };

    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    
    const conn = (navigator as any).connection;
    if (conn) {
      conn.addEventListener('change', checkConnection);
      checkConnection();
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      if (conn) {
        conn.removeEventListener('change', checkConnection);
      }
    };
  }, []);

  return null;
}
