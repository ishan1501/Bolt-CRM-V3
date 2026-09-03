import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface SingleSelectProps {
  value: string;
  options: Option[];
  onChange: (val: string) => void;
  placeholder?: string;
}

export function SingleSelect({ value, options, onChange, placeholder = "Select..." }: SingleSelectProps) {
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

  const selectedOption = options.find(o => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 bg-transparent text-sm font-medium outline-none cursor-pointer text-[var(--bolt-text-primary)] surface-3 border border-[var(--bolt-border-color)] rounded-lg px-3 py-1.5 min-w-[160px] max-w-[200px] hover:bg-[var(--bolt-hover-overlay)] transition-colors"
      >
        <span className="truncate">
          {displayLabel}
        </span>
        <ChevronDown size={14} className={cn("transition-transform opacity-50 shrink-0", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-[300px] overflow-y-auto surface-1 border border-[var(--bolt-border-color)] shadow-xl rounded-lg z-[100] py-1 animate-in fade-in zoom-in-95 duration-100">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-xs text-[var(--bolt-text-tertiary)]">No options</div>
          ) : (
            options.map(opt => {
              const selected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--bolt-bg-depth-3)] transition-colors group"
                >
                  <span className={cn("truncate flex-1", selected ? "text-[var(--bolt-text-primary)] font-semibold" : "text-[var(--bolt-text-secondary)] group-hover:text-[var(--bolt-text-primary)]")}>
                    {opt.label}
                  </span>
                  {selected && <Check size={14} className="text-[var(--bolt-accent)] shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
