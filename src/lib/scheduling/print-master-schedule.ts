import { escapeHtml } from "@/lib/estimating/print-window";
import type { Activity } from "@/types/scheduling";
import type { Project } from "@/types/project";

const STATUS_COLOR: Record<string, string> = {
  completed: "background:#dcfce7;color:#166534",
  in_progress: "background:#dbeafe;color:#1e40af",
  delayed: "background:#fee2e2;color:#991b1b",
  blocked: "background:#fee2e2;color:#991b1b",
  not_started: "background:#f3f4f6;color:#374151",
  ready: "background:#e0f2fe;color:#075985",
  cancelled: "background:#f3f4f6;color:#6b7280",
};

function statusChip(status: string): string {
  const style = STATUS_COLOR[status] ?? "background:#f3f4f6;color:#374151";
  return `<span style="display:inline-block;border-radius:4px;padding:2px 6px;font-size:10px;font-weight:600;${style}">${escapeHtml(status.replace("_", " "))}</span>`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Builds the full Master Schedule print document — every project (even
 * ones with nothing scheduled yet), every activity, sub-activities
 * indented under their parent. Self-contained HTML string for
 * openPrintWindow, so it never depends on the app's own CSS bundle
 * having loaded correctly.
 */
export function buildMasterScheduleHtml(projects: Project[], activities: Activity[]): string {
  const sections = projects
    .map((project) => {
      const projectActivities = activities
        .filter((a) => a.projectId === project.id)
        .sort((a, b) => new Date(a.plannedStart).getTime() - new Date(b.plannedStart).getTime());

      const rows = projectActivities.length
        ? projectActivities
            .map(
              (a) => `
              <tr>
                <td style="${a.parentActivityId ? "padding-left:20px;color:#4b5563;" : "font-weight:600;"}">
                  ${a.parentActivityId ? "&#8618; " : ""}${escapeHtml(a.name)}
                </td>
                <td>${formatDate(a.plannedStart)}</td>
                <td>${formatDate(a.plannedFinish)}</td>
                <td>${a.originalDurationDays}d</td>
                <td>${statusChip(a.status)}</td>
              </tr>`
            )
            .join("")
        : `<tr><td colspan="5" style="color:#6b7280;">No activities scheduled yet for this project.</td></tr>`;

      return `
        <h3 style="page-break-before:auto;">${escapeHtml(project.projectName)}
          <span style="font-weight:400;color:#6b7280;font-size:11px;text-transform:none;letter-spacing:0;">
            (${projectActivities.length} ${projectActivities.length === 1 ? "activity" : "activities"})
          </span>
        </h3>
        <table>
          <thead>
            <tr><th>Activity</th><th>Start</th><th>Finish</th><th>Duration</th><th>Status</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
    })
    .join("");

  return `
    <div class="header"><h1>Master Schedule — All Activities</h1><p>${projects.length} projects</p></div>
    ${sections || `<p>No projects to print.</p>`}
  `;
}
