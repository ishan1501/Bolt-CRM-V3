import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ size = 24, className }: { size?: number, className?: string }) {
  return (
    <Loader2 
      size={size} 
      className={cn("animate-spin text-[var(--bolt-accent)] drop-shadow-[0_0_8px_var(--bolt-accent-glow)]", className)} 
    />
  );
}
