import type { MaintenanceTask } from "@/types/maintenance";

function formatShortDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

function todayStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Short, copy-pasteable text reminder for Vinnie — just what's due
 * today, same idea as Pedro's update but scoped to Maintenance since
 * Vinnie won't look at the dashboard either (2026-07-20 meeting).
 */
export function generateVinnieDailyReminderText(date: Date, tasks: MaintenanceTask[]): string {
  const today = todayStr(date);
  const dueToday = tasks.filter(
    (t) => t.taskStatus !== "complete" && t.plannedCompletionDate === today
  );

  const lines: string[] = [];
  lines.push(`Good morning Vinnie! Hope you're doing well 🙂 Here's what's due ${formatShortDate(date)}:`);
  lines.push("");

  if (dueToday.length === 0) {
    lines.push("Nothing due today — thank you as always!");
    return lines.join("\n");
  }

  for (const t of dueToday.slice(0, 5)) {
    lines.push(`- ${t.propertyName ?? "Property"}: ${t.taskDescription}`);
  }

  lines.push("");
  lines.push("Thank you — let us know if anything comes up!");

  return lines.join("\n").trim();
}
