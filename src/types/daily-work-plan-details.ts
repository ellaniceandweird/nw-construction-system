import type { BaseEntity } from "@/types/common";

/** One crew member's attendance for a specific day. */
export interface CrewAttendanceEntry {
  employeeId: string;
  employeeName: string;
  present: boolean;
}

/** Which crew members are assigned to a specific activity/task for the day, plus what's specifically expected to be finished (which can be narrower than the activity's overall name). */
export interface TaskAssignmentEntry {
  activityId: string;
  assignedEmployeeIds: string[];
  dailyCompletionTarget?: string;
}

/** A material/item needed on site, tracked separately from formal Material Requests since this is a quick daily planning list, not a procurement workflow. */
export interface ProcurementNeedEntry {
  id: string;
  item: string;
  quantity?: string;
  neededByDate?: string;
  ordered: boolean;
}

/**
 * The planning-specific details for one calendar day that don't belong
 * on the Activity record itself (which spans the whole task, not just
 * today) — crew attendance, who's assigned to what today, what's
 * specifically expected done, equipment, and the rain plan.
 */
export interface DailyWorkPlanDetails extends BaseEntity {
  date: string;
  crewAttendance: CrewAttendanceEntry[];
  taskAssignments: TaskAssignmentEntry[];
  procurementNeeds: ProcurementNeedEntry[];
  equipmentNeeded?: string;
  rainPlan?: string;
}
