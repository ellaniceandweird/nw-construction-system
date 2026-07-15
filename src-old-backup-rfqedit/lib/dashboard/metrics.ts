import { MOCK_PROJECTS } from "@/lib/data/mock/projects";
import { MOCK_ACTIVITIES } from "@/lib/data/mock/activities";
import { MOCK_MAINTENANCE_TASKS } from "@/lib/data/mock/maintenance-tasks";
import { MOCK_DAILY_LOGS } from "@/lib/data/mock/daily-logs";

/**
 * All dashboard KPIs are computed here from the real mock data arrays —
 * nothing on the Dashboard page is a hardcoded number. Where the source
 * workbook doesn't yet contain a directly-matching field (e.g. there's no
 * real Purchase Order data yet — that arrives with the Procurement module),
 * the calculation is a clearly-commented, defensible proxy built from real
 * Activity/Maintenance records rather than an invented figure.
 */

const TODAY = new Date("2026-07-10");
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function daysBetween(a: Date, b: Date) {
  return (a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000);
}

export function getProjectsBehindSchedule() {
  return MOCK_PROJECTS.filter((p) => {
    if (p.completionPercent >= 100) return false;
    return new Date(p.plannedCompletionDate) < TODAY;
  });
}

export function getProjectsOverBudget() {
  return MOCK_PROJECTS.filter(
    (p) =>
      typeof p.actualCostToDate === "number" &&
      p.actualCostToDate > p.approvedBudget &&
      p.approvedBudget > 0
  );
}

/** Proxy: maintenance tasks logged but not yet started = awaiting action. */
export function getPendingApprovals() {
  return MOCK_MAINTENANCE_TASKS.filter((t) => t.taskStatus === "not_started");
}

export function getOverdueMaintenance() {
  return MOCK_MAINTENANCE_TASKS.filter((t) => {
    if (t.taskStatus === "complete" || !t.plannedCompletionDate) return false;
    return new Date(t.plannedCompletionDate) < TODAY;
  });
}

export function getMaintenanceDueThisWeek() {
  return MOCK_MAINTENANCE_TASKS.filter((t) => {
    if (t.taskStatus === "complete" || !t.plannedCompletionDate) return false;
    const due = new Date(t.plannedCompletionDate);
    const diff = due.getTime() - TODAY.getTime();
    return diff >= 0 && diff <= ONE_WEEK_MS;
  });
}

/**
 * Proxy for "Procurement Requiring Attention": no real Purchase Order data
 * exists yet in the source workbook (that arrives with Phase 8/Procurement
 * build-out), so this counts Master Schedule activities that need
 * materials/equipment and are currently delayed or blocked — a real,
 * defensible signal of procurement risk from data we actually have.
 */
export function getProcurementRequiringAttention() {
  return MOCK_ACTIVITIES.filter(
    (a) =>
      (a.status === "delayed" || a.status === "blocked") &&
      ((a.requiredMaterials?.length ?? 0) > 0 ||
        (a.requiredEquipment?.length ?? 0) > 0)
  );
}

export interface ProjectHealthBucket {
  label: "On Track" | "At Risk" | "Behind" | "Completed";
  count: number;
}

export function getProjectHealthBreakdown(): ProjectHealthBucket[] {
  let onTrack = 0,
    atRisk = 0,
    behind = 0,
    completed = 0;

  for (const p of MOCK_PROJECTS) {
    if (p.calculatedStatus === "closed") completed++;
    else if (p.calculatedStatus === "on_hold" || p.healthScore < 50) behind++;
    else if (p.healthScore < 75) atRisk++;
    else onTrack++;
  }

  return [
    { label: "On Track", count: onTrack },
    { label: "At Risk", count: atRisk },
    { label: "Behind", count: behind },
    { label: "Completed", count: completed },
  ];
}

export function getBudgetOverview() {
  const totalBudget = MOCK_PROJECTS.reduce((s, p) => s + (p.approvedBudget || 0), 0);
  const actualCost = MOCK_PROJECTS.reduce(
    (s, p) => s + (p.actualCostToDate || 0),
    0
  );
  const percentUsed = totalBudget > 0 ? Math.round((actualCost / totalBudget) * 100) : 0;
  return { totalBudget, actualCost, remaining: totalBudget - actualCost, percentUsed };
}

export interface ScheduleBucket {
  label: "On Schedule" | "At Risk" | "Behind Schedule" | "Not Started" | "Completed";
  count: number;
}

export function getScheduleOverview(): ScheduleBucket[] {
  let onSchedule = 0,
    atRisk = 0,
    behind = 0,
    notStarted = 0,
    completed = 0;

  for (const a of MOCK_ACTIVITIES) {
    if (a.status === "completed") completed++;
    else if (a.status === "delayed" || a.status === "blocked") behind++;
    else if (a.status === "not_started") notStarted++;
    else if (a.isCritical) atRisk++;
    else onSchedule++;
  }

  return [
    { label: "On Schedule", count: onSchedule },
    { label: "At Risk", count: atRisk },
    { label: "Behind Schedule", count: behind },
    { label: "Not Started", count: notStarted },
    { label: "Completed", count: completed },
  ];
}

export interface ActivityFeedItem {
  id: string;
  icon: "log" | "maintenance" | "project";
  description: string;
  subDescription?: string;
  date: Date;
}

export function getRecentActivityFeed(limit = 6): ActivityFeedItem[] {
  const items: ActivityFeedItem[] = [];

  for (const log of MOCK_DAILY_LOGS) {
    const project = MOCK_PROJECTS.find((p) => p.id === log.projectId);
    items.push({
      id: log.id,
      icon: "log",
      description: "Daily log added",
      subDescription: project?.projectName,
      date: new Date(log.date),
    });
  }

  for (const t of MOCK_MAINTENANCE_TASKS) {
    if (t.taskStatus === "complete" && t.dateCompleted) {
      items.push({
        id: `${t.id}-complete`,
        icon: "maintenance",
        description: `Maintenance completed: ${t.taskDescription}`,
        subDescription: t.propertyName,
        date: new Date(t.dateCompleted),
      });
    }
  }

  return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
}

export interface UpcomingDeadline {
  id: string;
  type: "Activity" | "Maintenance";
  item: string;
  projectOrProperty: string;
  dueDate: Date;
  status: "overdue" | "due_soon" | "upcoming";
}

export function getUpcomingDeadlines(limit = 6): UpcomingDeadline[] {
  const items: UpcomingDeadline[] = [];

  for (const a of MOCK_ACTIVITIES) {
    if (a.status === "completed") continue;
    const project = MOCK_PROJECTS.find((p) => p.id === a.projectId);
    const due = new Date(a.plannedFinish);
    const diffDays = daysBetween(due, TODAY); // negative = due date already passed
    items.push({
      id: a.id,
      type: "Activity",
      item: a.name,
      projectOrProperty: project?.projectName ?? "—",
      dueDate: due,
      status: diffDays < 0 ? "overdue" : diffDays <= 7 ? "due_soon" : "upcoming",
    });
  }

  for (const t of MOCK_MAINTENANCE_TASKS) {
    if (t.taskStatus === "complete" || !t.plannedCompletionDate) continue;
    const due = new Date(t.plannedCompletionDate);
    const diffDays = daysBetween(due, TODAY); // negative = due date already passed
    items.push({
      id: t.id,
      type: "Maintenance",
      item: t.taskDescription,
      projectOrProperty: t.propertyName ?? "—",
      dueDate: due,
      status: diffDays < 0 ? "overdue" : diffDays <= 7 ? "due_soon" : "upcoming",
    });
  }

  return items
    .filter((i) => daysBetween(i.dueDate, TODAY) >= -14) // drop stale overdue items >2 weeks old
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, limit);
}
