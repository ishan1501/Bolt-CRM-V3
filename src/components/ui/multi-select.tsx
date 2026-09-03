import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onToggle: (val: string) => void;
  onClear: () => void;
}

export function MultiSelect({ label, options, selectedValues, onToggle, onClear }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const count = selectedValues.length;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 bg-transparent text-sm font-medium outline-none cursor-pointer text-[var(--bolt-text-primary)] surface-3 border border-[var(--bolt-border-color)] rounded-lg px-3 py-1.5 min-w-[140px] hover:bg-[var(--bolt-hover-overlay)] transition-colors"
      >
        <span className="truncate max-w-[150px]">
          {count > 0 ? `${label} (${count})` : label}
        </span>
        <ChevronDown size={14} className={cn("transition-transform opacity-50", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-[300px] overflow-y-auto surface-1 border border-[var(--bolt-border-color)] shadow-xl rounded-lg z-[100] py-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 flex items-center justify-between border-b border-[var(--bolt-border-color)] mb-1">
            <span className="text-xs font-semibold text-[var(--bolt-text-secondary)] px-2">{label}</span>
            {count > 0 && (
              <button onClick={onClear} className="text-[10px] text-[var(--bolt-accent)] hover:underline px-2">
                Clear
              </button>
            )}
          </div>
          
          {options.length === 0 ? (
            <div className="px-4 py-2 text-xs text-[var(--bolt-text-tertiary)]">No options</div>
          ) : (
            options.map(opt => {
              const selected = selectedValues.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => onToggle(opt)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-[var(--bolt-bg-depth-3)] transition-colors group"
                >
                  <div className={cn(
                    "w-4 h-4 rounded-sm border flex items-center justify-center transition-colors shrink-0",
                    selected ? "bg-[var(--bolt-accent)] border-[var(--bolt-accent)]" : "border-[var(--bolt-border-color)] group-hover:border-[var(--bolt-text-secondary)]"
                  )}>
                    {selected && <Check size={12} className="text-white" />}
                  </div>
                  <span className="truncate text-[var(--bolt-text-primary)]">{opt}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
