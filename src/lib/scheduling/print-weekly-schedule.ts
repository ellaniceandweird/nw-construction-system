import { escapeHtml } from "@/lib/estimating/print-window";
import type { WeeklyScheduleColor } from "@/types/scheduling";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

const COLOR_HEX: Record<WeeklyScheduleColor, string> = {
  complete: "#16a34a",
  in_progress: "#2563eb",
  upcoming: "#ca8a04",
  delayed: "#dc2626",
  not_started: "transparent",
  blocked: "#7f1d1d",
};

export interface WeeklyScheduleEntry {
  activityId: string;
  projectName: string;
  taskDescription: string;
  crew?: string;
  dailyAllocation: Partial<Record<(typeof DAY_KEYS)[number], WeeklyScheduleColor>>;
}

/**
 * Builds the Weekly Schedule print document — self-contained HTML for
 * openPrintWindow, so it never depends on the app's own CSS bundle.
 */
export function buildWeeklyScheduleHtml(
  weekLabel: string,
  entries: WeeklyScheduleEntry[]
): string {
  const dayHeaders = DAY_LABELS.map((label) => `<th style="text-align:center;">${label}</th>`).join("");

  const rows = entries.length
    ? entries
        .map((entry) => {
          const dayCells = DAY_KEYS.map((key) => {
            const color = entry.dailyAllocation[key];
            if (!color || color === "not_started") return `<td style="text-align:center;">—</td>`;
            return `<td style="text-align:center;"><span style="display:inline-block;width:28px;height:14px;border-radius:3px;background:${COLOR_HEX[color]};" title="${escapeHtml(color.replace("_", " "))}"></span></td>`;
          }).join("");
          return `
            <tr>
              <td style="font-weight:600;">${escapeHtml(entry.projectName)}</td>
              <td>${escapeHtml(entry.taskDescription)}</td>
              <td>${escapeHtml(entry.crew ?? "—")}</td>
              ${dayCells}
            </tr>`;
        })
        .join("")
    : `<tr><td colspan="10" style="color:#6b7280;">No scheduled work this week.</td></tr>`;

  const legend = (Object.keys(COLOR_HEX) as WeeklyScheduleColor[])
    .filter((c) => c !== "not_started")
    .map(
      (c) =>
        `<span style="display:inline-flex;align-items:center;gap:4px;margin-right:12px;"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${COLOR_HEX[c]};"></span>${escapeHtml(c.replace("_", " "))}</span>`
    )
    .join("");

  return `
    <div class="header"><h1>Weekly Schedule — ${escapeHtml(weekLabel)}</h1></div>
    <table>
      <thead><tr><th>Project</th><th>Task</th><th>Crew</th>${dayHeaders}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:12px;font-size:11px;">${legend}</p>
  `;
}
