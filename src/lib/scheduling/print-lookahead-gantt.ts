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

const LABEL_COLUMN_WIDTH = 180; // px — must match on every row, including the header

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
 * Builds a real bar-chart lookahead print document. Every row — including
 * the week-header row itself — uses the exact same two-column layout: a
 * fixed LABEL_COLUMN_WIDTH title column on the left, then a flexible bar
 * area on the right where week gridlines and activity bars share the same
 * percentage coordinate space. This is what keeps the header dates,
 * gridlines, and bars all lined up with each other — previously the week
 * header ignored the label column's width entirely, so every date was
 * shifted left of where its gridline/bars actually were.
 */
function buildWeekHeaderRow(weekMarkers: WeekMarker[]): string {
  return `
    <div style="display:flex;align-items:flex-end;gap:8px;margin-bottom:4px;">
      <div style="width:${LABEL_COLUMN_WIDTH}px;flex-shrink:0;font-size:10px;font-weight:600;color:#374151;">Activities</div>
      <div style="position:relative;flex:1;height:16px;border-left:1px solid #d1d5db;border-bottom:1px solid #d1d5db;">
        ${weekMarkers
          .map(
            (w) =>
              `<div style="position:absolute;top:0;left:${w.leftPercent}%;padding-left:3px;font-size:9px;color:#6b7280;white-space:nowrap;">${escapeHtml(w.label)}</div>`
          )
          .join("")}
      </div>
    </div>`;
}

export function buildLookaheadGanttHtml(
  title: string,
  weekMarkers: WeekMarker[],
  groups: GanttPrintGroup[]
): string {
  const gridlinesHtml = weekMarkers
    .map((w) => `<div style="position:absolute;top:0;left:${w.leftPercent}%;height:100%;border-left:1px solid #f3f4f6;"></div>`)
    .join("");

  const sections = groups
    .map((group) => {
      const rows = group.items.length
        ? group.items
            .map((item) => {
              const color = BAR_COLOR[item.status] ?? "#9ca3af";
              return `
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                  <div style="width:${LABEL_COLUMN_WIDTH}px;flex-shrink:0;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(item.label)}">
                    ${item.isSubActivity ? "&#8618; " : ""}${escapeHtml(item.label)}
                  </div>
                  <div style="position:relative;flex:1;height:16px;border-left:1px solid #e5e7eb;">
                    ${gridlinesHtml}
                    <div
                      title="${escapeHtml(item.label)}: ${escapeHtml(item.sublabel)}"
                      style="position:absolute;top:2px;height:12px;border-radius:2px;left:${item.leftPercent}%;width:${Math.max(item.widthPercent, 0.6)}%;background:${color};${item.isCritical ? "outline:1px solid #111827;" : ""}"
                    ></div>
                  </div>
                </div>`;
            })
            .join("")
        : `<div style="display:flex;gap:8px;"><div style="width:${LABEL_COLUMN_WIDTH}px;flex-shrink:0;"></div><p style="font-size:10px;color:#6b7280;margin:0;">No activities scheduled in this window.</p></div>`;

      return `
        <h3 style="margin-bottom:4px;">${escapeHtml(group.projectName)}</h3>
        ${buildWeekHeaderRow(weekMarkers)}
        ${rows}`;
    })
    .join("<div style=\"margin-top:16px;\"></div>");

  return `
    <div class="header"><h1>${escapeHtml(title)}</h1></div>
    ${sections || `<p>No activities fall within this window (${groups.length} projects checked). If this seems wrong, refresh the page and try again.</p>`}
  `;
}
