import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Badge colors - light mode
    "bg-emerald-100", "text-emerald-800", "border-emerald-300",
    "bg-rose-100",    "text-rose-800",    "border-rose-300",
    "bg-orange-100",  "text-orange-800",  "border-orange-300",
    "bg-blue-100",    "text-blue-800",    "border-blue-300",
    "bg-red-100",     "text-red-800",     "border-red-300",
    "bg-teal-100",    "text-teal-800",    "border-teal-300",
    "bg-violet-100",  "text-violet-800",  "border-violet-300",
    "bg-amber-100",   "text-amber-800",   "border-amber-300",
    "bg-indigo-100",  "text-indigo-800",  "border-indigo-300",
    "bg-pink-100",    "text-pink-800",    "border-pink-300",
    "bg-sky-100",     "text-sky-800",     "border-sky-300",
    "bg-lime-100",    "text-lime-800",    "border-lime-300",
    "bg-cyan-100",    "text-cyan-800",    "border-cyan-300",
    "bg-fuchsia-100", "text-fuchsia-800", "border-fuchsia-300",
    "bg-slate-200",   "text-slate-800",   "border-slate-300",
    // Badge colors - dark mode
    "dark:bg-emerald-900/50", "dark:text-emerald-300", "dark:border-emerald-800/60",
    "dark:bg-rose-900/50",    "dark:text-rose-300",    "dark:border-rose-800/60",
    "dark:bg-orange-900/50",  "dark:text-orange-300",  "dark:border-orange-800/60",
    "dark:bg-blue-900/50",    "dark:text-blue-300",    "dark:border-blue-800/60",
    "dark:bg-red-900/50",     "dark:text-red-300",     "dark:border-red-800/60",
    "dark:bg-teal-900/50",    "dark:text-teal-300",    "dark:border-teal-800/60",
    "dark:bg-violet-900/50",  "dark:text-violet-300",  "dark:border-violet-800/60",
    "dark:bg-amber-900/50",   "dark:text-amber-300",   "dark:border-amber-800/60",
    "dark:bg-indigo-900/50",  "dark:text-indigo-300",  "dark:border-indigo-800/60",
    "dark:bg-pink-900/50",    "dark:text-pink-300",    "dark:border-pink-800/60",
    "dark:bg-sky-900/50",     "dark:text-sky-300",     "dark:border-sky-800/60",
    "dark:bg-lime-900/50",    "dark:text-lime-300",    "dark:border-lime-800/60",
    "dark:bg-cyan-900/50",    "dark:text-cyan-300",    "dark:border-cyan-800/60",
    "dark:bg-fuchsia-900/50", "dark:text-fuchsia-300", "dark:border-fuchsia-800/60",
    "dark:bg-slate-800",      "dark:text-slate-300",   "dark:border-slate-700",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bolt-bg-depth-1)",
        foreground: "var(--bolt-text-primary)",
      },
      fontFamily: {
        sans: ["Geist", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "infinite-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center"
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center"
          }
        }
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        "infinite-scroll": "infinite-scroll 25s linear infinite",
        "gradient-x": "gradient-x 3s ease infinite",
      },
    },
  },
  plugins: [],
};
export default config;
