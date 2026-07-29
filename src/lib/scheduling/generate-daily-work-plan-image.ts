import type { Activity } from "@/types/scheduling";
import type { Project } from "@/types/project";

const PALETTE = [
  { bg: "#dbeafe", accent: "#2563eb" }, // primary-soft
  { bg: "#dcfce7", accent: "#16a34a" }, // success-soft
  { bg: "#fef3c7", accent: "#b45309" }, // warning-soft
  { bg: "#e0f2fe", accent: "#0369a1" }, // info-soft
];

interface WorkItem {
  activity: Activity;
  assignedCrew: number;
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

/**
 * Draws a clean, pastel-toned summary card per project (date, activity,
 * manpower) onto a canvas and triggers a PNG download — a quick visual
 * to text/share with Pedro each morning, no screenshotting
 * required.
 */
export function generateDailyWorkPlanImage(date: Date, scheduled: WorkItem[], projects: Project[]) {
  const width = 900;
  const cardHeight = 96;
  const headerHeight = 110;
  const padding = 24;
  const gap = 14;

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
    totalCrew: items.reduce((sum, i) => sum + i.assignedCrew, 0),
  }));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.font = "500 15px system-ui, sans-serif";
  const measuredHeights = groups.map((g) => {
    const activityText = g.items.map((i) => i.activity.name).join("  •  ");
    const lines = wrapText(ctx, activityText, width - padding * 2 - 130);
    return Math.max(cardHeight, 60 + lines.length * 20);
  });
  const totalCardsHeight = measuredHeights.reduce((sum, h) => sum + h + gap, 0);
  const height = headerHeight + totalCardsHeight + padding + (groups.length === 0 ? 60 : 0);

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

  const totalCrew = groups.reduce((sum, g) => sum + g.totalCrew, 0);
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "500 13px system-ui, sans-serif";
  ctx.fillText(`${groups.length} project${groups.length === 1 ? "" : "s"} · ${totalCrew} total crew`, padding, 92);

  let y = headerHeight;
  groups.forEach((group, i) => {
    const cardH = measuredHeights[i];
    const colors = PALETTE[i % PALETTE.length];

    ctx.fillStyle = colors.bg;
    const radius = 16;
    const x = padding;
    const w = width - padding * 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + cardH, radius);
    ctx.arcTo(x + w, y + cardH, x, y + cardH, radius);
    ctx.arcTo(x, y + cardH, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#18181b";
    ctx.font = "700 19px system-ui, sans-serif";
    ctx.fillText(group.projectName, x + 20, y + 30);

    ctx.fillStyle = "#3f3f46";
    ctx.font = "500 15px system-ui, sans-serif";
    const activityText = group.items.map((it) => it.activity.name).join("  •  ");
    const lines = wrapText(ctx, activityText, w - 150);
    lines.forEach((line, li) => {
      ctx.fillText(line, x + 20, y + 55 + li * 20);
    });

    const pillText = `${group.totalCrew} ${group.totalCrew === 1 ? "person" : "people"}`;
    ctx.font = "700 15px system-ui, sans-serif";
    const pillWidth = ctx.measureText(pillText).width + 24;
    ctx.fillStyle = "#ffffff";
    const pillX = x + w - pillWidth - 16;
    const pillY = y + 16;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, 28, 14);
    ctx.fill();
    ctx.fillStyle = colors.accent;
    ctx.fillText(pillText, pillX + 12, pillY + 19);

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
