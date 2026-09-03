import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-sm",
        {
          "border-transparent bg-[var(--bolt-accent)] text-white hover:bg-[var(--bolt-accent-hover)] shadow-sm": variant === "default",
          "border-transparent bg-[var(--bolt-bg-depth-3)] text-[var(--bolt-text-secondary)] hover:bg-[var(--bolt-bg-depth-4)]": variant === "secondary",
          "border-transparent bg-rose-500/20 text-rose-300 hover:bg-rose-500/30": variant === "destructive",
          "border-[var(--bolt-border-color)] text-[var(--bolt-text-primary)]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
