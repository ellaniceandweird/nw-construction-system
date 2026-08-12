import type {
  Activity,
  Lookahead16Item,
  Lookahead4Item,
  WeeklyScheduleEntry,
  WeeklyScheduleColor,
  DailyWorkPlanEntry,
  WorkReadinessStatus,
} from "@/types/scheduling";

/**
 * Schedule Generation Engine (SDS §6.17-6.22).
 *
 * CRITICAL RULE: every function here is a pure, read-only VIEW over the
 * Master Schedule's Activity[] array. None of these functions mutate
 * Activity data or accept edits — per SDS §6.18, the Master Schedule is
 * the single source of truth, and the 16-week, 4-week, weekly, and daily
 * views exist only to slice and re-shape that one dataset for different
 * planning horizons. If a user needs to change a date or duration, that
 * change happens on the Activity record itself (Master Schedule page),
 * and every other view updates automatically because it's derived, not
 * separately stored.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function parseDate(d: string) {
  return new Date(d + (d.length === 10 ? "T00:00:00" : ""));
}

function overlaps(aStart: Date, aEnd: Date, windowStart: Date, windowEnd: Date) {
  return aStart <= windowEnd && aEnd >= windowStart;
}

/** SDS §6.19 — 16-Week Lookahead: all activities overlapping the next 16 weeks. */
export function generateLookahead16(
  activities: Activity[],
  referenceDate: Date
): Lookahead16Item[] {
  const windowEnd = new Date(referenceDate.getTime() + 16 * WEEK_MS);

  return activities
    .filter((a) => {
      const start = parseDate(a.plannedStart);
      const end = parseDate(a.plannedFinish);
      return overlaps(start, end, referenceDate, windowEnd) && a.status !== "cancelled";
    })
    .sort((a, b) => parseDate(a.plannedStart).getTime() - parseDate(b.plannedStart).getTime())
    .map((a) => ({
      activityId: a.id,
      wbsPath: a.wbsPath,
      costCode: a.costCode,
      description: a.name,
      plannedStart: a.plannedStart,
      plannedFinish: a.plannedFinish,
      actualStart: a.actualStart,
      actualFinish: a.actualFinish,
      remainingDurationDays: a.remainingDurationDays,
      percentComplete: a.percentComplete,
      assignedCrew: a.assignedCrew,
      responsiblePerson: a.responsiblePerson ?? a.assignedForeman,
      procurementStatus: a.deliveryStatus,
      materialStatus: a.requiredMaterials?.length ? "required" : undefined,
      equipmentStatus: a.requiredEquipment?.length ? "required" : undefined,
      aiRiskIndicator: a.aiRiskIndicator,
      isCritical: a.isCritical,
      isDelayed: a.status === "delayed",
    }));
}

/**
 * SDS §6.20 — 4-Week Lookahead with work-readiness classification.
 *
 * Readiness flags below are computed from real Activity fields where the
 * data exists (materials/equipment/crew required, dependencies, current
 * status). Flags with no real underlying data source yet in this build
 * (permits, RFIs, submittals — those arrive with the Documents module)
 * default to true so they don't falsely block readiness; they're marked
 * with a comment so it's obvious this is a placeholder, not a real check.
 */
export function generateLookahead4(
  activities: Activity[],
  referenceDate: Date
): Lookahead4Item[] {
  const windowEnd = new Date(referenceDate.getTime() + 4 * WEEK_MS);

  return activities
    .filter((a) => {
      const start = parseDate(a.plannedStart);
      const end = parseDate(a.plannedFinish);
      return (
        overlaps(start, end, referenceDate, windowEnd) &&
        a.status !== "completed" &&
        a.status !== "cancelled"
      );
    })
    .sort((a, b) => parseDate(a.plannedStart).getTime() - parseDate(b.plannedStart).getTime())
    .map((a) => {
      const materialReady = (a.requiredMaterials?.length ?? 0) === 0 || a.deliveryStatus === "delivered";
      const crewAvailable = !!(a.assignedCrew || a.requiredManpower);
      const equipmentAvailable = (a.requiredEquipment?.length ?? 0) === 0 || true; // no live equipment-booking data yet
      const dependenciesComplete = !a.dependencies?.length; // no dependency graph populated in this data set yet

      let workStatus: WorkReadinessStatus;
      if (a.status === "blocked") workStatus = "blocked";
      else if (a.status === "delayed") workStatus = "at_risk";
      else if (materialReady && crewAvailable) workStatus = "ready";
      else workStatus = "nearly_ready";

      return {
        activityId: a.id,
        description: a.name,
        plannedStart: a.plannedStart,
        plannedFinish: a.plannedFinish,
        readiness: {
          scheduleReady: true,
          materialReady,
          crewAvailable,
          equipmentAvailable,
          permitsApproved: true, // placeholder — no permits data source yet
          rfisClosed: true, // placeholder — wired up once Documents/RFI module exists
          submittalsApproved: true, // placeholder — same as above
          weatherRisk: false, // placeholder — no weather feed integrated yet
          dependenciesComplete,
        },
        workStatus,
        materialRequired: a.requiredMaterials?.join(", "),
        materialDelivered: a.deliveryStatus === "delivered",
        equipmentRequired: a.requiredEquipment?.join(", "),
        crewAssigned: a.assignedCrew,
        openRfiCount: a.rfiIds?.length ?? 0,
        openSubmittalCount: a.submittalIds?.length ?? 0,
      };
    });
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

const WEEKDAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function dayColorFor(activity: Activity, day: Date, today: Date): WeeklyScheduleColor {
  const start = parseDate(activity.plannedStart);
  const end = parseDate(activity.plannedFinish);

  if (day < start || day > end) return "not_started"; // outside this activity's own window entirely
  if (activity.status === "blocked") return "blocked";
  if (activity.status === "delayed") return "delayed";
  if (activity.status === "completed") return "complete";
  if (day < today) return "complete"; // day already passed within an in-progress activity
  if (day.getTime() === today.setHours(0, 0, 0, 0)) return "in_progress";
  return "upcoming";
}

/** SDS §6.21 — Weekly Schedule, color-coded per day for one Mon–Sun week. */
export function generateWeeklySchedule(
  activities: Activity[],
  weekStart: Date,
  today: Date
): WeeklyScheduleEntry[] {
  const monday = startOfWeek(weekStart);
  const sunday = new Date(monday.getTime() + 6 * DAY_MS);

  return activities
    .filter((a) => {
      const start = parseDate(a.plannedStart);
      const end = parseDate(a.plannedFinish);
      return overlaps(start, end, monday, sunday) && a.status !== "cancelled";
    })
    .map((a) => {
      const dailyAllocation: WeeklyScheduleEntry["dailyAllocation"] = {};
      WEEKDAY_KEYS.forEach((key, i) => {
        const day = new Date(monday.getTime() + i * DAY_MS);
        const start = parseDate(a.plannedStart);
        const end = parseDate(a.plannedFinish);
        if (day >= start && day <= end) {
          dailyAllocation[key] = dayColorFor(a, day, new Date(today));
        }
      });

      return {
        activityId: a.id,
        area: a.area ?? a.location,
        taskDescription: a.name,
        crew: a.assignedCrew,
        foreman: a.assignedForeman,
        numberOfWorkers: a.requiredManpower,
        equipmentRequired: a.requiredEquipment,
        materialsRequired: a.requiredMaterials,
        dailyAllocation,
        priority: a.isCritical ? "high" : "medium",
      } satisfies WeeklyScheduleEntry;
    });
}

/** SDS §6.22 — Daily Work Plan for a single day, auto-generated from the Weekly Schedule. */
export function generateDailyWorkPlan(activities: Activity[], date: Date): DailyWorkPlanEntry[] {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  return activities
    .filter((a) => {
      const start = parseDate(a.plannedStart);
      const end = parseDate(a.plannedFinish);
      return day >= start && day <= end && a.status !== "cancelled" && a.status !== "completed";
    })
    .map((a) => ({
      activityId: a.id,
      date: day.toISOString().slice(0, 10),
      area: a.area ?? a.location,
      task: a.name,
      crew: a.assignedCrew,
      plannedWorkers: a.requiredManpower,
      equipment: a.requiredEquipment,
      materials: a.requiredMaterials,
      inspectionRequired: false, // placeholder — wired up once Field Ops inspections module exists
    }));
}
