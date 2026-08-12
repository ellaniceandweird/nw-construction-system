import type { Activity } from "@/types/scheduling";
import type { Project } from "@/types/project";

function formatShortDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

function formatCompletionDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Builds the short, copy-pasteable text Ben and Sjaak talked about on
 * 2026-07-20 — something Ella can generate every morning around 7:45
 * and paste straight into the group text with Pedro, since he's not
 * going to look at the dashboard. Grouped by project so a crew
 * splitting time across two jobs still gets one clear message.
 *
 * Deliberately plain text, no formatting that could get mangled by SMS.
 */
export function generateDailyFieldUpdateText(
  date: Date,
  scheduled: Array<{ activity: Activity; assignedCrew: number }>,
  projects: Project[]
): string {
  const byProject = new Map<string, Array<{ activity: Activity; assignedCrew: number }>>();
  for (const s of scheduled) {
    if (!byProject.has(s.activity.projectId)) byProject.set(s.activity.projectId, []);
    byProject.get(s.activity.projectId)!.push(s);
  }

  const lines: string[] = [];
  lines.push(`Good morning Pedro! Here's the plan for ${formatShortDate(date)}:`);
  lines.push("");

  if (byProject.size === 0) {
    lines.push("Nothing scheduled today — give Ella a call if that doesn't sound right.");
    return lines.join("\n");
  }

  for (const [projectId, items] of byProject) {
    const project = projects.find((p) => p.id === projectId);
    lines.push(`${project?.projectName ?? "Project"} — due ${project ? formatCompletionDate(project.plannedCompletionDate) : "—"}`);
    for (const item of items.slice(0, 5)) {
      lines.push(`- ${item.activity.name} (${item.assignedCrew} ${item.assignedCrew === 1 ? "person" : "people"})`);
    }
    lines.push("");
  }

  lines.push("Thank you as always — let us know if anything comes up!");

  return lines.join("\n").trim();
}
