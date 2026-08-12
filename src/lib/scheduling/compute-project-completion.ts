import type { Activity } from "@/types/scheduling";

/**
 * % Complete for a project = % of its scheduled activities marked
 * "completed" — a real, live number rather than a static stored value.
 * Cancelled activities are excluded from both the count and the total,
 * since they were never actually going to be done.
 */
export function computeProjectCompletionPercent(projectId: string, activities: Activity[]): number {
  const relevant = activities.filter((a) => a.projectId === projectId && a.status !== "cancelled");
  if (relevant.length === 0) return 0;
  const completed = relevant.filter((a) => a.status === "completed").length;
  return Math.round((completed / relevant.length) * 100);
}
