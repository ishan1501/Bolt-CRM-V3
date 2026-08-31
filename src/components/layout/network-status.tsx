"use client";

import { useEffect, useState } from "react";
import { WifiOff, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    
    const checkConnection = () => {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn) {
        // effectiveType can be 'slow-2g', '2g', '3g', or '4g'
        if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.effectiveType === '3g') {
          setIsSlow(true);
        } else {
          setIsSlow(false);
        }
      }
    };

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      checkConnection();
    };

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

  return (
    <AnimatePresence>
      {(isOffline || isSlow) && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[9999]"
        >
          {isOffline ? (
            <div className="bg-red-500 text-white px-4 py-3 rounded-2xl shadow-[0_10px_40px_rgba(239,68,68,0.4)] flex items-center gap-3 font-medium text-sm border border-red-400">
              <WifiOff size={18} />
              <span>You are currently offline. Check your connection.</span>
            </div>
          ) : (
            <div className="bg-orange-500 text-white px-4 py-3 rounded-2xl shadow-[0_10px_40px_rgba(249,115,22,0.4)] flex items-center gap-3 font-medium text-sm border border-orange-400">
              <Activity size={18} className="animate-pulse" />
              <span>Slow connection detected. Loading may take longer.</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
