import { cn } from "@/lib/utils"

export function Shimmer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-[var(--bolt-bg-depth-3)]",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[var(--bolt-hover-overlay-md)] to-transparent" />
    </div>
  )
}
