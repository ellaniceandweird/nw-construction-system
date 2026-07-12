import type { BaseEntity } from "@/types/common";

// Activity has its own operational status vocabulary (ActivityStatus) that's
// richer than the generic RecordStatus every other entity uses — see below.

/**
 * Scheduling Module data models.
 * Source: SDS Volume 3 §6, esp. §6.4 (Master Schedule fields), §6.6
 * (Dependencies), §6.7 (Constraints), §6.17-6.22 (Generation Engine and the
 * 16-week / 4-week / weekly / daily derived views).
 *
 * IMPORTANT (SDS §6.18 — Master Schedule Rules / Single Source of Truth):
 * `Activity` is the ONLY record users edit directly. Every other type in
 * this file (Lookahead16Item, Lookahead4Item, WeeklyScheduleEntry,
 * DailyWorkPlanEntry) is a DERIVED VIEW computed from Activity[] — never
 * stored or edited independently. The generation functions that produce
 * them live in lib/scheduling/ (built in Phase 7).
 */

export type ActivityStatus =
  | "not_started"
  | "ready"
  | "in_progress"
  | "delayed"
  | "blocked"
  | "completed"
  | "cancelled";

export type DependencyType = "FS" | "SS" | "FF" | "SF";

export type ConstraintType =
  | "must_start_on"
  | "must_finish_on"
  | "start_no_earlier_than"
  | "finish_no_later_than"
  | "mandatory_finish"
  | "mandatory_start";

/** SDS §6.6 — Activity Dependencies. */
export interface ActivityDependency {
  predecessorId: string;
  type: DependencyType;
  lagDays?: number;
  leadDays?: number;
  notes?: string;
}

/** SDS §6.7 — Activity Constraints. */
export interface ActivityConstraint {
  type: ConstraintType;
  date: string;
  notes?: string;
}

/**
 * SDS §6.4 — Master Schedule activity record.
 * The Single Source of Truth for all project planning (SDS §6.18).
 */
export interface Activity extends Omit<BaseEntity, "status"> {
  projectId: string;

  // Identification
  activityCode: string;
  costCode?: string;
  wbsPath: string; // e.g. "Exterior Renovation > Roofing > Framing"
  parentActivityId?: string;
  name: string;
  description?: string;

  // Project information
  area?: string;
  building?: string;
  floor?: string;
  zone?: string;
  location?: string;

  // Responsibility
  responsibleDepartment?: string;
  responsiblePerson?: string;
  assignedCrew?: string;
  assignedForeman?: string;
  assignedProjectEngineer?: string;

  // Scheduling information
  plannedStart: string;
  plannedFinish: string;
  actualStart?: string;
  actualFinish?: string;
  originalDurationDays: number;
  remainingDurationDays: number;
  calendarId: string;
  totalFloatDays?: number;
  freeFloatDays?: number;
  isCritical: boolean;

  // Progress
  percentComplete: number;
  physicalProgress?: number;
  financialProgress?: number;
  earnedValue?: number;

  // Resource information
  requiredManpower?: number;
  requiredEquipment?: string[];
  requiredMaterials?: string[];
  requiredSubcontractor?: string;

  // Procurement links (SDS §6.4 Procurement Links)
  purchaseOrderIds?: string[];
  materialRequestIds?: string[];
  vendorId?: string;
  deliveryStatus?: "pending" | "in_transit" | "delivered" | "delayed";

  // Document links
  drawingIds?: string[];
  rfiIds?: string[];
  submittalIds?: string[];

  dependencies?: ActivityDependency[];
  constraints?: ActivityConstraint[];

  status: ActivityStatus;

  /** AI Risk Indicator surfaced on lookahead views (SDS §6.19, Volume 4). */
  aiRiskIndicator?: "low" | "medium" | "high";
}

/** SDS §6.8 — Calendars. */
export interface WorkCalendar {
  id: string;
  name: string;
  type: "company" | "project" | "crew" | "holiday" | "weather";
  workingDays: (
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
  )[];
  workingHoursStart: string; // "07:00"
  workingHoursEnd: string; // "15:30"
  holidays: string[]; // ISO dates
}

/** SDS §6.16 — Schedule Baselines. */
export interface ScheduleBaseline {
  id: string;
  projectId: string;
  type: "original" | "approved_revision" | "client" | "internal";
  createdDate: string;
  activitySnapshots: Array<{
    activityId: string;
    plannedStart: string;
    plannedFinish: string;
    originalDurationDays: number;
  }>;
}

/* ------------------------------------------------------------------ *
 * DERIVED VIEWS — never edited directly, always generated from
 * Activity[] by the Schedule Generation Engine (Phase 7).
 * ------------------------------------------------------------------ */

/** SDS §6.19 — 16-Week Lookahead row. */
export interface Lookahead16Item {
  activityId: string;
  wbsPath: string;
  costCode?: string;
  description: string;
  plannedStart: string;
  plannedFinish: string;
  actualStart?: string;
  actualFinish?: string;
  remainingDurationDays: number;
  percentComplete: number;
  assignedCrew?: string;
  responsiblePerson?: string;
  procurementStatus?: string;
  materialStatus?: string;
  equipmentStatus?: string;
  constraintStatus?: string;
  aiRiskIndicator?: "low" | "medium" | "high";
  isCritical: boolean;
  isDelayed: boolean;
}

/** SDS §6.20 — 4-Week Lookahead readiness classification. */
export type WorkReadinessStatus = "ready" | "nearly_ready" | "at_risk" | "blocked";

export interface Lookahead4Item {
  activityId: string;
  description: string;
  plannedStart: string;
  plannedFinish: string;
  readiness: {
    scheduleReady: boolean;
    materialReady: boolean;
    crewAvailable: boolean;
    equipmentAvailable: boolean;
    permitsApproved: boolean;
    rfisClosed: boolean;
    submittalsApproved: boolean;
    weatherRisk: boolean;
    dependenciesComplete: boolean;
  };
  workStatus: WorkReadinessStatus;
  materialRequired?: string;
  materialOrdered?: boolean;
  materialDelivered?: boolean;
  equipmentRequired?: string;
  crewAssigned?: string;
  openRfiCount: number;
  openSubmittalCount: number;
  plannerNotes?: string;
}

/** SDS §6.21 — Weekly Schedule color coding, tied to design tokens in globals.css. */
export type WeeklyScheduleColor =
  | "complete"
  | "in_progress"
  | "upcoming"
  | "delayed"
  | "not_started"
  | "blocked";

export interface WeeklyScheduleEntry {
  activityId: string;
  area?: string;
  taskDescription: string;
  crew?: string;
  foreman?: string;
  numberOfWorkers?: number;
  trade?: string;
  equipmentRequired?: string[];
  materialsRequired?: string[];
  /** Per-day allocation for Mon-Sun of the selected week. */
  dailyAllocation: Partial<
    Record<
      "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
      WeeklyScheduleColor
    >
  >;
  priority: "low" | "medium" | "high";
}

/** SDS §6.22 — Daily Work Plan (auto-generated from the Weekly Schedule). */
export interface DailyWorkPlanEntry {
  activityId: string;
  date: string;
  area?: string;
  task: string;
  crew?: string;
  plannedWorkers?: number;
  estimatedHours?: number;
  equipment?: string[];
  materials?: string[];
  safetyHazards?: string[];
  qualityChecks?: string[];
  inspectionRequired?: boolean;
  weatherForecast?: string;
  notes?: string;

  // Filled in at end of day (SDS §6.22 Daily Deliverables) — writes back to Activity
  actualHours?: number;
  workersPresent?: number;
  actualProgress?: number;
  materialsUsed?: string[];
  equipmentUsed?: string[];
  safetyIssues?: string;
  delayReason?: string;
  comments?: string;
}
