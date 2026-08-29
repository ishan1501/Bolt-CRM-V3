const COLORS = ["blue", "emerald", "indigo", "violet", "fuchsia", "rose", "orange", "amber", "cyan", "teal", "sky", "pink", "lime"];
for (const c of COLORS) {
  console.log(`  "bg-${c}-100 text-${c}-800 border-${c}-300 dark:bg-${c}-900/50 dark:text-${c}-300 dark:border-${c}-800/60",`);
}
