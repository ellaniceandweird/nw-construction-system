import type { Activity } from "@/types/scheduling";

/**
 * Crew Capacity Automation Layer.
 *
 * Nice & Weird currently has 8 real crew members total (per the real
 * worker roster in the Daily Log data — Pedro, Federico, Brandon, Jose,
 * Margarito, Angel, Fredy, Alfredo). This module checks, for any given
 * day, whether the Master Schedule is asking for more manpower than
 * actually exists, and — if so — automatically decides which activities
 * get priority (critical-path work first, then earliest start date) and
 * which ones should be flagged to reschedule.
 *
 * This does NOT change any Activity data. It's a read-only planning
 * check layered on top of the schedule, same as the lookahead views.
 */
export const TOTAL_AVAILABLE_CREW = 8;

function parseDate(d: string) {
  return new Date(d + (d.length === 10 ? "T00:00:00" : ""));
}

export interface CrewCapacityResult {
  date: string;
  totalRequired: number;
  totalAvailable: number;
  isOverCapacity: boolean;
  /** Activities that fit within the 8-person limit today, in priority order. */
  scheduled: Array<{ activity: Activity; assignedCrew: number }>;
  /** Activities that don't fit — recommended to reschedule or add crew. */
  deferred: Array<{ activity: Activity; neededCrew: number }>;
}

/**
 * Prioritizes today's activities against the real crew limit.
 * Priority order: critical-path activities first, then activities already
 * in progress (finish what's started), then earliest planned start date.
 */
export function getCrewCapacityForDay(
  activities: Activity[],
  date: Date,
  totalAvailableCrew: number = TOTAL_AVAILABLE_CREW
): CrewCapacityResult {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  const activeToday = activities.filter((a) => {
    const start = parseDate(a.plannedStart);
    const end = parseDate(a.plannedFinish);
    return day >= start && day <= end && a.status !== "cancelled" && a.status !== "completed";
  });

  const prioritized = [...activeToday].sort((a, b) => {
    if (a.isCritical !== b.isCritical) return a.isCritical ? -1 : 1;
    if (a.status === "in_progress" && b.status !== "in_progress") return -1;
    if (b.status === "in_progress" && a.status !== "in_progress") return 1;
    return parseDate(a.plannedStart).getTime() - parseDate(b.plannedStart).getTime();
  });

  const scheduled: CrewCapacityResult["scheduled"] = [];
  const deferred: CrewCapacityResult["deferred"] = [];
  let remainingCrew = totalAvailableCrew;
  let totalRequired = 0;

  for (const activity of prioritized) {
    const needed = activity.requiredManpower ?? 1;
    totalRequired += needed;

    if (needed <= remainingCrew) {
      scheduled.push({ activity, assignedCrew: needed });
      remainingCrew -= needed;
    } else {
      deferred.push({ activity, neededCrew: needed });
    }
  }

  return {
    date: day.toISOString().slice(0, 10),
    totalRequired,
    totalAvailable: totalAvailableCrew,
    isOverCapacity: totalRequired > totalAvailableCrew,
    scheduled,
    deferred,
  };
}

export type WorkType = "internal" | "subcontractor";

/** Derives whether an activity is internal crew work or subcontracted. */
export function getWorkType(activity: Activity): WorkType {
  return activity.requiredSubcontractor ? "subcontractor" : "internal";
}
