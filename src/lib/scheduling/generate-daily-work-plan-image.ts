import type { Activity } from "@/types/scheduling";
import type { Project } from "@/types/project";

// One consistent, high-contrast look for every project — no color
// rotation. Deliberately large text throughout since this is read
// quickly on a phone, often outdoors, by someone who isn't sitting at a
// desk studying it.
const INK = "#111827";
const SUBTLE = "#6b7280";
const BORDER = "#d1d5db";
const ACCENT = "#1d4ed8";
const PILL_BG = "#eef2ff";
const PILL_TEXT = "#1e3a8a";

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

function pillWidth(ctx: CanvasRenderingContext2D, text: string): number {
  return ctx.measureText(text).width + 28;
}

/**
 * Draws a clean, large-text, single-color summary onto a canvas and
 * triggers a PNG download — meant to be read at a glance on a phone,
 * often outdoors. Deliberately plain: no per-project color coding (that
 * added visual noise without adding information), just clear black text
 * on white with one accent color used consistently for "today's target."
 */
export function generateDailyWorkPlanImage(date: Date, scheduled: WorkItem[], projects: Project[]) {
  const width = 1000;
  const padding = 32;
  const gap = 20;
  const headerHeight = 110;

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

  // First pass: measure every task block's real height so nothing gets
  // cut off or overlaps — crew pills and completion targets both wrap.
  const taskLayouts = groups.map((group) =>
    group.items.map((item) => {
      let h = 40; // task name row
      if (item.assignedCrewNames?.length) {
        ctx.font = "700 20px system-ui, sans-serif";
        let rows = 1;
        let rowWidth = 0;
        for (const name of item.assignedCrewNames) {
          const w = pillWidth(ctx, name);
          if (rowWidth + w > width - padding * 2 - 40) {
            rows++;
            rowWidth = 0;
          }
          rowWidth += w + 8;
        }
        h += rows * 42;
      } else {
        h += 28;
      }
      if (item.dailyCompletionTarget) {
        ctx.font = "600 19px system-ui, sans-serif";
        const lines = wrapText(ctx, item.dailyCompletionTarget, width - padding * 2 - 80);
        h += 30 + (lines.length - 1) * 26;
      }
      return h + 26;
    })
  );

  const groupHeights = groups.map((group, gi) => {
    const headerH = 56;
    const dividerH = 16;
    const tasksH = taskLayouts[gi].reduce((sum, h) => sum + h, 0);
    return headerH + tasksH + dividerH;
  });

  const totalHeight = groupHeights.reduce((sum, h) => sum + h + gap, 0);
  const height = headerHeight + totalHeight + padding + (groups.length === 0 ? 80 : 0);

  canvas.width = width * 2;
  canvas.height = height * 2;
  ctx.scale(2, 2);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = INK;
  ctx.font = "800 34px system-ui, sans-serif";
  ctx.fillText("Daily Work Plan", padding, 48);

  ctx.fillStyle = SUBTLE;
  ctx.font = "600 20px system-ui, sans-serif";
  ctx.fillText(
    date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    padding,
    78
  );

  ctx.beginPath();
  ctx.moveTo(padding, 96);
  ctx.lineTo(width - padding, 96);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();

  let y = headerHeight;
  const cardX = padding;
  const cardW = width - padding * 2;

  groups.forEach((group, gi) => {
    const cardH = groupHeights[gi];

    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 1.5;
    const radius = 14;
    ctx.beginPath();
    ctx.moveTo(cardX + radius, y);
    ctx.arcTo(cardX + cardW, y, cardX + cardW, y + cardH, radius);
    ctx.arcTo(cardX + cardW, y + cardH, cardX, y + cardH, radius);
    ctx.arcTo(cardX, y + cardH, cardX, y, radius);
    ctx.arcTo(cardX, y, cardX + cardW, y, radius);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = INK;
    ctx.font = "800 24px system-ui, sans-serif";
    ctx.fillText(group.projectName, cardX + 20, y + 36);

    let taskY = y + 68;
    group.items.forEach((item) => {
      ctx.fillStyle = INK;
      ctx.font = "700 21px system-ui, sans-serif";
      ctx.fillText(item.activity.name, cardX + 20, taskY);
      let rowY = taskY + 32;

      if (item.assignedCrewNames?.length) {
        ctx.font = "700 20px system-ui, sans-serif";
        let pillX = cardX + 20;
        for (const name of item.assignedCrewNames) {
          const w = pillWidth(ctx, name);
          if (pillX + w > cardX + cardW - 20) {
            pillX = cardX + 20;
            rowY += 42;
          }
          ctx.fillStyle = PILL_BG;
          ctx.beginPath();
          ctx.roundRect(pillX, rowY - 22, w, 32, 16);
          ctx.fill();
          ctx.fillStyle = PILL_TEXT;
          ctx.fillText(name, pillX + 14, rowY);
          pillX += w + 8;
        }
        rowY += 30;
      } else {
        ctx.fillStyle = SUBTLE;
        ctx.font = "600 19px system-ui, sans-serif";
        ctx.fillText(`${item.assignedCrew} ${item.assignedCrew === 1 ? "person" : "people"} needed`, cardX + 20, rowY);
        rowY += 24;
      }

      if (item.dailyCompletionTarget) {
        ctx.fillStyle = ACCENT;
        ctx.font = "800 19px system-ui, sans-serif";
        const label = "TODAY: ";
        ctx.fillText(label, cardX + 20, rowY + 14);
        const labelWidth = ctx.measureText(label).width;
        ctx.fillStyle = INK;
        ctx.font = "600 19px system-ui, sans-serif";
        const lines = wrapText(ctx, item.dailyCompletionTarget, cardW - 40 - labelWidth);
        lines.forEach((line, li) => {
          const lx = li === 0 ? cardX + 20 + labelWidth : cardX + 20;
          ctx.fillText(line, lx, rowY + 14 + li * 26);
        });
        rowY += 20 + (lines.length - 1) * 26;
      }

      taskY = rowY + 26;
    });

    y += cardH + gap;
  });

  if (groups.length === 0) {
    ctx.fillStyle = SUBTLE;
    ctx.font = "600 22px system-ui, sans-serif";
    ctx.fillText("No work scheduled for this day.", padding, y + 36);
  }

  const link = document.createElement("a");
  link.download = `daily-work-plan-${date.toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
