"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isEligible = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull to refresh if we are at the top of the container
      if (container.scrollTop <= 0) {
        isEligible.current = true;
        startY.current = e.touches[0].clientY;
      } else {
        isEligible.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isEligible.current || isRefreshing) return;
      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;

      if (distance > 0 && container.scrollTop <= 0) {
        // Prevent default scrolling when pulling down
        if (e.cancelable) e.preventDefault();
        
        setIsPulling(true);
        // Add resistance
        setPullDistance(Math.min(distance * 0.4, 100));
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling || isRefreshing) return;
      
      if (pullDistance > 60) {
        setIsRefreshing(true);
        // Trigger reload
        window.location.reload();
      }
      
      setIsPulling(false);
      setPullDistance(0);
      isEligible.current = false;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    // Use { passive: false } for touchmove to allow e.preventDefault()
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPulling, isRefreshing, pullDistance]);

  return (
    <div 
      ref={containerRef} 
      className="flex-1 overflow-x-hidden overflow-y-auto pb-32 md:pb-0 relative"
    >
      {/* Pull indicator */}
      <div 
        className="absolute left-0 right-0 flex justify-center items-center pointer-events-none z-50 transition-transform"
        style={{ 
          transform: `translateY(${Math.max(pullDistance - 40, -40)}px)`,
          opacity: Math.min(pullDistance / 60, 1)
        }}
      >
        <div className="bg-[var(--bolt-bg-depth-3)] rounded-full p-2 shadow-lg border border-[var(--bolt-border-color)]">
          <Loader2 
            size={20} 
            className={`text-[var(--bolt-accent)] ${isRefreshing ? "animate-spin" : ""}`}
            style={{ transform: !isRefreshing ? `rotate(${pullDistance * 3}deg)` : undefined }}
          />
        </div>
      </div>
      
      <div 
        className="transition-transform duration-200 min-h-full flex flex-col"
        style={{ transform: isPulling ? `translateY(${pullDistance}px)` : "none" }}
      >
        {children}
      </div>
    </div>
  );
}
