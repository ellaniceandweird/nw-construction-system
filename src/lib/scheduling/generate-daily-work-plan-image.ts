import type { Activity } from "@/types/scheduling";
import type { Project } from "@/types/project";

const PALETTE = [
  { bg: "#dbeafe", accent: "#2563eb", pill: "#eff6ff", pillText: "#1d4ed8" },
  { bg: "#dcfce7", accent: "#16a34a", pill: "#f0fdf4", pillText: "#15803d" },
  { bg: "#fef3c7", accent: "#b45309", pill: "#fffbeb", pillText: "#92400e" },
  { bg: "#e0f2fe", accent: "#0369a1", pill: "#f0f9ff", pillText: "#075985" },
];

interface WorkItem {
  activity: Activity;
  assignedCrew: number;
  /** Real crew member names, when available — falls back to just showing the count if not. */
  assignedCrewNames?: string[];
  /** What's specifically expected to be finished today, separate from the task's overall name. */
  dailyCompletionTarget?: string;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Measures how tall one pill needs to be sized — used for both layout and drawing so the two stay in sync. */
function pillWidth(ctx: CanvasRenderingContext2D, text: string): number {
  return ctx.measureText(text).width + 20;
}

/**
 * Draws a clean, card-per-task summary onto a canvas and triggers a PNG
 * download — a quick visual to text/share with Pedro each morning.
 * Deliberately simple: task name, who's on it (by name when known), and
 * what's specifically expected done today — nothing more, so it stays
 * easy to read at a glance on a phone.
 */
export function generateDailyWorkPlanImage(date: Date, scheduled: WorkItem[], projects: Project[]) {
  const width = 900;
  const padding = 24;
  const gap = 12;
  const headerHeight = 100;

  const byProject = new Map<string, WorkItem[]>();
  for (const item of scheduled) {
    const list = byProject.get(item.activity.projectId) ?? [];
    list.push(item);
    byProject.set(item.activity.projectId, list);
  }
  const groups = Array.from(byProject.entries()).map(([projectId, items]) => ({
    projectId,
    projectName: projects.find((p) => p.id === projectId)?.projectName ?? "—",
    items,
  }));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // First pass: measure every task card's real height (crew pills wrap,
  // completion target wraps) so nothing gets cut off or overlaps.
  const taskLayouts = groups.map((group) =>
    group.items.map((item) => {
      let h = 44; // task name row
      const crewLabel = item.assignedCrewNames?.length
        ? null // drawn as pills below, height added separately
        : `${item.assignedCrew} ${item.assignedCrew === 1 ? "person" : "people"}`;
      if (item.assignedCrewNames?.length) {
        h += 34; // one row of pills (wraps handled at draw time, approximated here)
      } else if (crewLabel) {
        h += 4;
      }
      if (item.dailyCompletionTarget) {
        ctx.font = "500 13px system-ui, sans-serif";
        const lines = wrapText(ctx, item.dailyCompletionTarget, width - padding * 2 - 60);
        h += 22 + (lines.length - 1) * 18;
      }
      return h + 18; // bottom padding within the task block
    })
  );

  const groupHeights = groups.map((group, gi) => {
    const headerH = 40;
    const tasksH = taskLayouts[gi].reduce((sum, h) => sum + h, 0);
    return headerH + tasksH + 20;
  });

  const totalHeight = groupHeights.reduce((sum, h) => sum + h + gap, 0);
  const height = headerHeight + totalHeight + padding + (groups.length === 0 ? 60 : 0);

  canvas.width = width * 2;
  canvas.height = height * 2;
  ctx.scale(2, 2);

  ctx.fillStyle = "#fafaf9";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#18181b";
  ctx.font = "700 26px system-ui, sans-serif";
  ctx.fillText("Daily Work Plan", padding, 44);

  ctx.fillStyle = "#71717a";
  ctx.font = "500 16px system-ui, sans-serif";
  ctx.fillText(
    date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    padding,
    70
  );

  const totalCrew = scheduled.reduce((sum, i) => sum + i.assignedCrew, 0);
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "500 13px system-ui, sans-serif";
  ctx.fillText(`${groups.length} project${groups.length === 1 ? "" : "s"} · ${totalCrew} total crew`, padding, 92);

  let y = headerHeight;
  const cardX = padding;
  const cardW = width - padding * 2;

  groups.forEach((group, gi) => {
    const colors = PALETTE[gi % PALETTE.length];
    const cardH = groupHeights[gi];

    ctx.fillStyle = colors.bg;
    const radius = 16;
    ctx.beginPath();
    ctx.moveTo(cardX + radius, y);
    ctx.arcTo(cardX + cardW, y, cardX + cardW, y + cardH, radius);
    ctx.arcTo(cardX + cardW, y + cardH, cardX, y + cardH, radius);
    ctx.arcTo(cardX, y + cardH, cardX, y, radius);
    ctx.arcTo(cardX, y, cardX + cardW, y, radius);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#18181b";
    ctx.font = "700 19px system-ui, sans-serif";
    ctx.fillText(group.projectName, cardX + 20, y + 30);

    let taskY = y + 52;
    group.items.forEach((item, ti) => {
      ctx.fillStyle = "#27272a";
      ctx.font = "600 15px system-ui, sans-serif";
      ctx.fillText(item.activity.name, cardX + 20, taskY);
      let rowY = taskY + 24;

      if (item.assignedCrewNames?.length) {
        ctx.font = "600 12px system-ui, sans-serif";
        let pillX = cardX + 20;
        for (const name of item.assignedCrewNames) {
          const w = pillWidth(ctx, name);
          if (pillX + w > cardX + cardW - 20) {
            pillX = cardX + 20;
            rowY += 26;
          }
          ctx.fillStyle = colors.pill;
          ctx.beginPath();
          ctx.roundRect(pillX, rowY - 15, w, 22, 11);
          ctx.fill();
          ctx.fillStyle = colors.pillText;
          ctx.fillText(name, pillX + 10, rowY);
          pillX += w + 6;
        }
        rowY += 20;
      } else {
        ctx.fillStyle = "#71717a";
        ctx.font = "500 13px system-ui, sans-serif";
        ctx.fillText(`${item.assignedCrew} ${item.assignedCrew === 1 ? "person" : "people"}`, cardX + 20, rowY);
        rowY += 18;
      }

      if (item.dailyCompletionTarget) {
        ctx.fillStyle = colors.accent;
        ctx.font = "700 13px system-ui, sans-serif";
        ctx.fillText("Today's target:", cardX + 20, rowY + 12);
        const targetLabelWidth = ctx.measureText("Today's target: ").width;
        ctx.fillStyle = "#3f3f46";
        ctx.font = "500 13px system-ui, sans-serif";
        const lines = wrapText(ctx, item.dailyCompletionTarget, cardW - 40 - targetLabelWidth);
        lines.forEach((line, li) => {
          const lx = li === 0 ? cardX + 20 + targetLabelWidth + 4 : cardX + 20;
          ctx.fillText(line, lx, rowY + 12 + li * 18);
        });
        rowY += 16 + (lines.length - 1) * 18;
      }

      taskY = rowY + 22;
    });

    y += cardH + gap;
  });

  if (groups.length === 0) {
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "500 16px system-ui, sans-serif";
    ctx.fillText("No work scheduled for this day.", padding, y + 30);
  }

  const link = document.createElement("a");
  link.download = `daily-work-plan-${date.toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
