"use client";

import { useTheme } from "next-themes";
import { useSettingsStore } from "@/stores/settings-store";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

type ThemeOption = "light" | "dark" | "system";

const OPTIONS: { value: ThemeOption; label: string; Icon: React.ElementType }[] = [
  { value: "light",  label: "Light",  Icon: Sun },
  { value: "dark",   label: "Dark",   Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { themePreference, setThemePreference } = useSettingsStore();

  // On mount, sync stored preference → next-themes (handles refresh)
  useEffect(() => {
    setTheme(themePreference);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (value: ThemeOption) => {
    setTheme(value);
    setThemePreference(value);
  };

  const active = (theme as ThemeOption) || themePreference;

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bolt-bg-depth-3)] border border-[var(--bolt-border-color)]">
      {OPTIONS.map(({ value, label, Icon }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-[var(--bolt-accent)] text-black shadow-sm"
                : "text-[var(--bolt-text-secondary)] hover:text-[var(--bolt-text-primary)] hover:bg-[var(--bolt-hover-overlay)]"
            )}
            title={`Switch to ${label} mode`}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
