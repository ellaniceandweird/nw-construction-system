import { escapeHtml } from "@/lib/estimating/print-window";

export interface DailyPlanPrintRow {
  projectName: string;
  taskName: string;
  crew: number | string;
  workType: "internal" | "subcontractor";
  statusLabel: string;
  statusTone: "scheduled" | "needs_crew";
}

/**
 * Builds the Daily Work Plan print document — self-contained HTML for
 * openPrintWindow, so it never depends on the app's own CSS bundle.
 */
export function buildDailyWorkPlanHtml(dateLabel: string, rows: DailyPlanPrintRow[]): string {
  const body = rows.length
    ? rows
        .map((r) => {
          const workTypeStyle = r.workType === "internal" ? "background:#dbeafe;color:#1e40af" : "background:#e0f2fe;color:#075985";
          const statusStyle = r.statusTone === "scheduled" ? "background:#dcfce7;color:#166534" : "background:#fee2e2;color:#991b1b";
          return `
            <tr>
              <td style="font-weight:600;">${escapeHtml(r.projectName)}</td>
              <td>${escapeHtml(r.taskName)}</td>
              <td>${escapeHtml(String(r.crew))}</td>
              <td><span style="display:inline-block;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:600;${workTypeStyle}">${r.workType === "internal" ? "Our Crew" : "Subcontractor"}</span></td>
              <td><span style="display:inline-block;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:600;${statusStyle}">${escapeHtml(r.statusLabel)}</span></td>
            </tr>`;
        })
        .join("")
    : `<tr><td colspan="5" style="color:#6b7280;">No work planned for this day.</td></tr>`;

  return `
    <div class="header"><h1>Daily Work Plan — ${escapeHtml(dateLabel)}</h1></div>
    <table>
      <thead><tr><th>Project</th><th>Task</th><th>Workers</th><th>Type</th><th>Status</th></tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
}
