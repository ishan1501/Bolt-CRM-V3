import React from "react";

export function BrandLogo({ className, iconOnly }: { className?: string, iconOnly?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <img src="/bolt-logo.png" alt="Bolt" className="h-7 w-7 object-contain" />
      {!iconOnly && (
        <>
          <span className="font-extrabold tracking-tight text-white hidden sm:inline-block">Bolt</span>
          <span className="text-gray-500 font-bold text-xs mx-0.5 hidden sm:inline-block">✕</span>
          <img src="/logo.png" alt="Masters' Union" className="h-5 w-auto object-contain hidden sm:inline-block" />
        </>
      )}
    </div>
  );
}
