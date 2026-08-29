import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  depth?: 1 | 2 | 3 | 4;
}

export function GlassCard({ children, className, depth = 2, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        `surface-${depth}`,
        "backdrop-blur-md rounded-xl shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
