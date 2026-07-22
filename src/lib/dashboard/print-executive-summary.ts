import { escapeHtml } from "@/lib/estimating/print-window";
import type { Project } from "@/types/project";
import type { UpcomingWorkItem } from "@/lib/dashboard/metrics";

function currency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ExecutiveSummaryInput {
  totalBudget: number;
  actualCost: number;
  remaining: number;
  percentUsed: number;
  behindSchedule: Project[];
  overBudget: Project[];
  pendingApprovalsCount: number;
  upcomingWork: UpcomingWorkItem[];
}

/**
 * Opens a standalone, card-styled print window for the Dashboard's
 * executive summary — deliberately mirrors the in-app look (rounded
 * KPI tiles, colored accents) rather than the plain table style used
 * for line-item reports elsewhere, since this one page is meant to be
 * glanced at, not read line by line.
 */
export function printExecutiveSummary(input: ExecutiveSummaryInput) {
  const printWindow = window.open("", "_blank", "width=900,height=1100");
  if (!printWindow) {
    alert("Your browser blocked the print window. Please allow pop-ups for this site and try again.");
    return;
  }

  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  function kpiTile(label: string, value: number, colorVar: string) {
    return `
      <div style="flex:1; min-width:140px; background:oklch(0.985 0.003 247.86); border:1px solid oklch(0.9 0.01 260); border-radius:14px; padding:16px;">
        <div style="width:32px; height:32px; border-radius:10px; background:${colorVar}; margin-bottom:10px;"></div>
        <div style="font-size:11px; font-weight:500; color:oklch(0.55 0.02 265); margin-bottom:2px;">${label}</div>
        <div style="font-size:26px; font-weight:700; color:oklch(0.24 0.02 265); line-height:1;">${value}</div>
      </div>`;
  }

  function projectRow(p: Project, issue: string, issueColor: string) {
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-bottom:1px solid oklch(0.92 0.01 260);">
        <div>
          <div style="font-size:13px; font-weight:600; color:oklch(0.24 0.02 265);">${escapeHtml(p.projectName)}</div>
          <div style="font-size:11px; color:oklch(0.55 0.02 265);">${escapeHtml(p.address.street)}</div>
        </div>
        <span style="font-size:11px; font-weight:600; padding:4px 10px; border-radius:999px; background:${issueColor}22; color:${issueColor};">${issue}</span>
      </div>`;
  }

  const projectRows = [
    ...input.behindSchedule.map((p) => projectRow(p, "Behind Schedule", "oklch(0.78 0.13 65)")),
    ...input.overBudget.map((p) => projectRow(p, "Over Budget", "oklch(0.65 0.18 25)")),
  ].join("");

  const workByProject = new Map<string, { projectName: string; items: UpcomingWorkItem[] }>();
  for (const item of input.upcomingWork) {
    if (!workByProject.has(item.projectId)) {
      workByProject.set(item.projectId, { projectName: item.projectName, items: [] });
    }
    workByProject.get(item.projectId)!.items.push(item);
  }

  const accentColors = [
    "oklch(0.62 0.11 250)",
    "oklch(0.72 0.12 155)",
    "oklch(0.78 0.13 65)",
    "oklch(0.65 0.15 320)",
    "oklch(0.7 0.13 200)",
  ];

  const upcomingWorkCards = [...workByProject.values()]
    .map((group, i) => {
      const color = accentColors[i % accentColors.length];
      const activityRows = group.items
        .map(
          (item) => `
          <div style="padding:10px 0; border-top:1px solid oklch(0.94 0.01 260 / 0.7);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:12.5px; font-weight:500; color:oklch(0.24 0.02 265);">${escapeHtml(item.activityName)}</span>
              <span style="font-size:11px; color:oklch(0.55 0.02 265); white-space:nowrap; margin-left:12px;">${formatShortDate(item.plannedStart)} – ${formatShortDate(item.plannedFinish)}</span>
            </div>
            <div style="height:6px; border-radius:999px; background:oklch(0.92 0.01 260);">
              <div style="height:6px; border-radius:999px; width:${item.percentComplete}%; background:${color};"></div>
            </div>
          </div>`
        )
        .join("");

      return `
        <div style="background:oklch(0.985 0.003 247.86); border:1px solid oklch(0.9 0.01 260); border-left:4px solid ${color}; border-radius:14px; padding:16px 18px; margin-bottom:12px; break-inside:avoid;">
          <div style="font-size:14px; font-weight:700; color:oklch(0.24 0.02 265); margin-bottom:2px;">${escapeHtml(group.projectName)}</div>
          <div style="font-size:11px; color:oklch(0.55 0.02 265); margin-bottom:4px;">${group.items.length} ${group.items.length === 1 ? "activity" : "activities"} in the next 2 weeks</div>
          ${activityRows}
        </div>`;
    })
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Executive Summary</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Arial, sans-serif;
            color: oklch(0.24 0.02 265);
            background: white;
            padding: 40px;
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          @media print {
            body { padding: 0; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      </head>
      <body>
        <div style="display:flex; align-items:baseline; justify-content:space-between; border-bottom:2px solid oklch(0.24 0.02 265); padding-bottom:14px; margin-bottom:24px;">
          <div>
            <div style="font-size:20px; font-weight:700;">Nice &amp; Weird Group</div>
            <div style="font-size:12px; color:oklch(0.55 0.02 265); margin-top:2px;">Executive Summary</div>
          </div>
          <div style="font-size:12px; color:oklch(0.55 0.02 265);">${dateStr}</div>
        </div>

        <div style="display:flex; gap:12px; margin-bottom:28px;">
          ${kpiTile("Behind Schedule", input.behindSchedule.length, "oklch(0.78 0.13 65 / 0.25)")}
          ${kpiTile("Over Budget", input.overBudget.length, "oklch(0.65 0.18 25 / 0.25)")}
          ${kpiTile("Pending Approvals", input.pendingApprovalsCount, "oklch(0.62 0.11 250 / 0.25)")}
        </div>

        <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:oklch(0.55 0.02 265); margin-bottom:10px;">Financial Snapshot</div>
        <div style="background:oklch(0.985 0.003 247.86); border:1px solid oklch(0.9 0.01 260); border-radius:14px; padding:18px; margin-bottom:28px;">
          <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:13px;">
            <span style="color:oklch(0.55 0.02 265);">Total Budget (all active projects)</span>
            <span style="font-weight:600;">${currency(input.totalBudget)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:13px;">
            <span style="color:oklch(0.55 0.02 265);">Actual Cost to Date</span>
            <span style="font-weight:600;">${currency(input.actualCost)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:13px; border-top:1px solid oklch(0.9 0.01 260); margin-top:4px; padding-top:10px;">
            <span style="color:oklch(0.55 0.02 265);">Remaining Budget</span>
            <span style="font-weight:600;">${currency(input.remaining)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; padding:10px 0 0; font-size:15px; font-weight:700;">
            <span>% of Budget Used</span>
            <span>${input.percentUsed}%</span>
          </div>
        </div>

        <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:oklch(0.55 0.02 265); margin-bottom:10px;">Needs Your Attention</div>
        <div style="background:oklch(0.985 0.003 247.86); border:1px solid oklch(0.9 0.01 260); border-radius:14px; overflow:hidden; margin-bottom:28px;">
          ${projectRows || `<div style="padding:16px; font-size:13px; color:oklch(0.55 0.02 265);">Nothing flagged — every active project is on schedule and within budget.</div>`}
        </div>

        <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:oklch(0.55 0.02 265); margin-bottom:10px;">Upcoming Work — Next 2 Weeks</div>
        ${upcomingWorkCards || `<div style="background:oklch(0.985 0.003 247.86); border:1px solid oklch(0.9 0.01 260); border-radius:14px; padding:16px; font-size:13px; color:oklch(0.55 0.02 265);">Nothing scheduled to start or continue in the next two weeks.</div>`}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}
