import type { Activity } from "@/types/scheduling";

export interface PlanVsActualResult {
  label: string;
  tone: "success" | "warning" | "destructive" | "muted";
  varianceDays: number | null;
}

function daysBetween(a: string, b: string): number {
  const aDate = new Date(a + "T00:00:00");
  const bDate = new Date(b + "T00:00:00");
  return Math.round((aDate.getTime() - bDate.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Compares planned vs actual dates for one activity. If it's finished,
 * compares actual finish to planned finish (the real outcome). If it's
 * still in progress or not started, compares today against the planned
 * finish — a running "are we still on track" read.
 */
export function computePlanVsActual(activity: Activity, today: Date): PlanVsActualResult {
  const todayStr = today.toISOString().slice(0, 10);

  if (activity.status === "completed") {
    if (!activity.actualFinish) {
      return { label: "Completed (no actual date logged)", tone: "muted", varianceDays: null };
    }
    const variance = daysBetween(activity.actualFinish, activity.plannedFinish);
    if (variance <= 0) return { label: variance === 0 ? "Finished on time" : `Finished ${Math.abs(variance)}d early`, tone: "success", varianceDays: variance };
    return { label: `Finished ${variance}d late`, tone: "destructive", varianceDays: variance };
  }

  if (activity.status === "cancelled") {
    return { label: "Cancelled", tone: "muted", varianceDays: null };
  }

  if (activity.status === "not_started" || activity.status === "ready") {
    if (todayStr > activity.plannedStart) {
      const variance = daysBetween(todayStr, activity.plannedStart);
      return { label: `${variance}d late to start`, tone: "warning", varianceDays: variance };
    }
    return { label: "Not started yet", tone: "muted", varianceDays: null };
  }

  // in_progress, delayed, blocked — compare today against planned finish
  const variance = daysBetween(todayStr, activity.plannedFinish);
  if (variance <= 0) return { label: "On track", tone: "success", varianceDays: variance };
  return { label: `${variance}d behind`, tone: "destructive", varianceDays: variance };
}
