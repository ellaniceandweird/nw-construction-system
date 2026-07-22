import type { BaseEntity, Attachment } from "@/types/common";

/**
 * Field Operations Module data models.
 * Source: SDS Volume 3 §7 — Daily Log (§7.4), Weather (§7.5), Crew
 * Attendance (§7.6), Labor (§7.8), Equipment (§7.10), Material Consumption
 * (§7.11), Deliveries (§7.12), Safety (§7.13), Quality (§7.14), Inspections
 * (§7.15), Site Diary (§7.16), Photos (§7.17), Delay Reporting (§7.18).
 */

export type WeatherCondition =
  | "clear"
  | "cloudy"
  | "partly_cloudy"
  | "light_rain"
  | "heavy_rain"
  | "snow"
  | "high_winds"
  | "fog"
  | "storm"
  | "extreme_heat"
  | "extreme_cold";

/**
 * One worker's time on one project/activity for the day. A worker who
 * splits their day across two projects gets two entries (same
 * employeeId, different projectId) instead of needing two separate
 * daily logs — this is the structure Sjaak asked for on 2026-07-20.
 */
export interface DailyTimeEntry {
  employeeId: string;
  employeeName: string;
  trade?: string;
  status: "present" | "absent" | "late";
  /** Real Property id, or unset/manual if typed by hand (propertyName holds the text either way). */
  propertyId?: string;
  propertyName?: string;
  /** Real Project id, or the MANUAL_ENTRY sentinel if typed by hand (projectName holds the text in that case). */
  projectId: string;
  projectName?: string;
  activityId?: string; // GENERAL_WORK_ACTIVITY_ID, MANUAL_ACTIVITY_ID, or a real Activity id from that project's schedule
  activityDescription: string;
  regularHours: number;
  overtimeHours: number;
  notes?: string; // manual/free-text entry for anything not captured by the activity dropdown
}

export interface MaterialConsumptionEntry {
  material: string;
  supplier?: string;
  purchaseOrderId?: string;
  activityId?: string;
  quantityPlanned: number;
  quantityUsed: number;
  remainingQuantity: number;
  wasteQuantity?: number;
  unit: string;
  locationInstalled?: string;
  remarks?: string;
}

export type DeliveryStatus =
  | "on_time"
  | "early"
  | "late"
  | "partial"
  | "rejected"
  | "damaged";

export interface MaterialDeliveryEntry {
  vendorId: string;
  deliveryDate: string;
  arrivalTime?: string;
  driver?: string;
  purchaseOrderId: string;
  itemsDelivered: string;
  quantity: number;
  backorderedItems?: string;
  damagedItems?: string;
  acceptedBy?: string;
  photoIds?: string[];
  status: DeliveryStatus;
}

export type IncidentSeverity = "low" | "moderate" | "high" | "critical";

export interface SafetyIncident extends BaseEntity {
  projectId: string;
  incidentNumber: string;
  date: string;
  location?: string;
  description: string;
  personsInvolved?: string[];
  rootCause?: string;
  correctiveAction?: string;
  photoIds?: string[];
  severity: IncidentSeverity;
}

export type InspectionResult =
  | "pass"
  | "pass_with_comments"
  | "fail"
  | "rework_required"
  | "hold";

export interface QualityInspection extends BaseEntity {
  projectId: string;
  inspector: string;
  date: string;
  area?: string;
  activityId?: string;
  category: string;
  result: InspectionResult;
  photoIds?: string[];
  correctiveAction?: string;
  verificationDate?: string;
}

export type InspectionSource =
  | "internal"
  | "owner"
  | "architect"
  | "municipal"
  | "engineering"
  | "third_party"
  | "manufacturer"
  | "warranty";

export interface SiteDiaryEntry extends BaseEntity {
  projectId: string;
  timestamp: string;
  author: string;
  category:
    | "client_meeting"
    | "weather_event"
    | "site_condition"
    | "utility_discovery"
    | "neighbor_complaint"
    | "permit_issue"
    | "change_directive"
    | "subcontractor_coordination"
    | "general_observation";
  description: string;
  relatedActivityId?: string;
  attachments?: Attachment[];
}

export type PhotoCategory =
  | "progress"
  | "safety"
  | "quality"
  | "delivery"
  | "deficiency"
  | "before_work"
  | "during_work"
  | "after_work"
  | "punch_list"
  | "closeout";

/** SDS §7.17 — Field Photos. */
export interface FieldPhoto extends BaseEntity {
  projectId: string;
  projectName?: string; // set when projectId is the manual-entry sentinel
  propertyId?: string;
  propertyName?: string;
  activityId?: string;
  dateTaken: string;
  uploadedBy: string;
  location?: string;
  caption?: string;
  tags?: string[];
  category: PhotoCategory;
  fileUrl: string;
  fileVersion: number;
  /** Best-effort thumbnail (e.g. from Google Drive) — may not always load; falls back to a generic icon. */
  thumbnailUrl?: string;
}

export interface DelayReport extends BaseEntity {
  projectId: string;
  activityId: string;
  delayCategory: string;
  startTime: string;
  endTime?: string;
  durationHours?: number;
  description: string;
  responsibleParty?: string;
  photoIds?: string[];
  weatherImpact: boolean;
  scheduleImpact?: string;
  recommendedAction?: string;
}

/**
 * SDS §7.4 — Daily Log: the primary end-of-day operational record.
 * Composes every field-ops sub-record for a single project-day.
 */
export interface DailyLog extends BaseEntity {
  projectId: string;
  dailyLogNumber: string;
  date: string;
  dayOfWeek: string;
  preparedBy: string;
  reviewedBy?: string;
  superintendent?: string;
  projectEngineer?: string;

  weatherCondition: WeatherCondition;
  temperature?: number;
  wind?: string;
  humidity?: number;
  workingHours?: string;
  shift?: "day" | "night" | "weekend";
  overallSiteStatus?: string;

  timeEntries: DailyTimeEntry[];
  materialDeliveries: MaterialDeliveryEntry[];
  materialConsumption: MaterialConsumptionEntry[];
  safetyIncidentIds?: string[];
  qualityInspectionIds?: string[];
  visitors?: string[];
  inspectionIds?: string[];
  delayReportIds?: string[];
  photoIds?: string[];
  generalNotes?: string;
}
