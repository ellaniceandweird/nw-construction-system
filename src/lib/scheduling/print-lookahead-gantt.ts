import { escapeHtml } from "@/lib/estimating/print-window";

const BAR_COLOR: Record<string, string> = {
  completed: "#16a34a",
  in_progress: "#2563eb",
  delayed: "#dc2626",
  blocked: "#dc2626",
  not_started: "#9ca3af",
  ready: "#2563eb",
  cancelled: "#9ca3af",
};

export interface GanttPrintItem {
  label: string;
  sublabel: string;
  leftPercent: number;
  widthPercent: number;
  status: string;
  isCritical?: boolean;
  isSubActivity?: boolean;
}

export interface GanttPrintGroup {
  projectName: string;
  items: GanttPrintItem[];
}

export interface WeekMarker {
  label: string;
  leftPercent: number;
}

/**
 * Builds a real bar-chart lookahead print document (not just a data
 * table) — every bar is an absolutely-positioned inline-styled <div>
 * inside a relatively-positioned row, exactly matching the percentages
 * used by the on-screen chart. Self-contained HTML for openPrintWindow,
 * so nothing depends on the app's own CSS bundle.
 */
export function buildLookaheadGanttHtml(
  title: string,
  weekMarkers: WeekMarker[],
  groups: GanttPrintGroup[]
): string {
  const markerHtml = weekMarkers
    .map(
      (w) =>
        `<div style="position:absolute;top:0;left:${w.leftPercent}%;border-left:1px solid #d1d5db;padding-left:3px;font-size:9px;color:#6b7280;">${escapeHtml(w.label)}</div>`
    )
    .join("");

  const sections = groups
    .map((group) => {
      const rows = group.items.length
        ? group.items
            .map((item) => {
              const color = BAR_COLOR[item.status] ?? "#9ca3af";
              const gridlines = weekMarkers
                .map((w) => `<div style="position:absolute;top:0;left:${w.leftPercent}%;height:100%;border-left:1px solid #f3f4f6;"></div>`)
                .join("");
              return `
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                  <div style="width:160px;flex-shrink:0;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(item.label)}">
                    ${item.isSubActivity ? "&#8618; " : ""}${escapeHtml(item.label)}
                  </div>
                  <div style="position:relative;flex:1;height:16px;border-left:1px solid #e5e7eb;">
                    ${gridlines}
                    <div
                      title="${escapeHtml(item.label)}: ${escapeHtml(item.sublabel)}"
                      style="position:absolute;top:2px;height:12px;border-radius:2px;left:${item.leftPercent}%;width:${Math.max(item.widthPercent, 0.6)}%;background:${color};${item.isCritical ? "outline:1px solid #111827;" : ""}"
                    ></div>
                  </div>
                </div>`;
            })
            .join("")
        : `<p style="font-size:10px;color:#6b7280;">No activities scheduled in this window.</p>`;

      return `
        <h3>${escapeHtml(group.projectName)}</h3>
        <div style="position:relative;height:16px;margin-bottom:6px;border-bottom:1px solid #d1d5db;">${markerHtml}</div>
        ${rows}`;
    })
    .join("<div style=\"margin-top:16px;\"></div>");

  return `
    <div class="header"><h1>${escapeHtml(title)}</h1></div>
    ${sections || `<p>No activities fall within this window (${groups.length} projects checked). If this seems wrong, refresh the page and try again.</p>`}
  `;
}
