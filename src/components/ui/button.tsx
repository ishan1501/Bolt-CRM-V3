import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "ghost" | "danger" | "outline" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
          {
            // Primary / accent
            "bg-[var(--bolt-accent)] text-black font-semibold hover:bg-[var(--bolt-accent-hover)] focus-visible:ring-[var(--bolt-accent-glow)] shadow-sm": variant === "default",
            // Secondary — theme-safe surface
            "bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)] hover:bg-[var(--bolt-bg-depth-4)] text-[var(--bolt-text-primary)]": variant === "secondary",
            // Outline
            "border border-[var(--bolt-border-color)] bg-transparent hover:bg-[var(--bolt-hover-overlay)] text-[var(--bolt-text-primary)]": variant === "outline",
            // Ghost
            "hover:bg-[var(--bolt-hover-overlay)] text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)]": variant === "ghost",
            // Danger
            "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 focus-visible:ring-rose-500/30": variant === "danger",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-8 rounded-lg px-3 text-xs": size === "sm",
            "h-12 rounded-xl px-8": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
