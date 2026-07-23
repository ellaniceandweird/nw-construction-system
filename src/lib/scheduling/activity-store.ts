"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_ACTIVITIES } from "@/lib/data/mock/activities";
import type { Activity, ActivityStatus } from "@/types/scheduling";

/**
 * Live Master Schedule data store, backed by Supabase.
 *
 * Per SDS §6.18, the Master Schedule is the ONLY place Activity data is
 * edited — every other view (16-week, 4-week, weekly, daily) is a
 * generated view over this exact array.
 */

function fromRow(row: Record<string, any>): Activity {
  return {
    id: row.id,
    projectId: row.project_id,
    activityCode: row.activity_code,
    costCode: row.cost_code ?? undefined,
    wbsPath: row.wbs_path,
    parentActivityId: row.parent_activity_id ?? undefined,
    name: row.name,
    description: row.description ?? undefined,
    area: row.area ?? undefined,
    building: row.building ?? undefined,
    floor: row.floor ?? undefined,
    zone: row.zone ?? undefined,
    location: row.location ?? undefined,
    responsibleDepartment: row.responsible_department ?? undefined,
    responsiblePerson: row.responsible_person ?? undefined,
    assignedCrew: row.assigned_crew ?? undefined,
    assignedForeman: row.assigned_foreman ?? undefined,
    assignedProjectEngineer: row.assigned_project_engineer ?? undefined,
    plannedStart: row.planned_start,
    plannedFinish: row.planned_finish,
    actualStart: row.actual_start ?? undefined,
    actualFinish: row.actual_finish ?? undefined,
    originalDurationDays: row.original_duration_days ?? 1,
    remainingDurationDays: row.remaining_duration_days ?? 1,
    calendarId: row.calendar_id ?? "CAL-COMPANY",
    totalFloatDays: row.total_float_days ?? undefined,
    freeFloatDays: row.free_float_days ?? undefined,
    isCritical: row.is_critical ?? false,
    percentComplete: Number(row.percent_complete ?? 0),
    physicalProgress: row.physical_progress != null ? Number(row.physical_progress) : undefined,
    financialProgress: row.financial_progress != null ? Number(row.financial_progress) : undefined,
    earnedValue: row.earned_value != null ? Number(row.earned_value) : undefined,
    requiredManpower: row.required_manpower != null ? Number(row.required_manpower) : undefined,
    requiredEquipment: row.required_equipment ?? undefined,
    requiredMaterials: row.required_materials ?? undefined,
    requiredSubcontractor: row.required_subcontractor ?? undefined,
    purchaseOrderIds: row.purchase_order_ids ?? undefined,
    materialRequestIds: row.material_request_ids ?? undefined,
    vendorId: row.vendor_id ?? undefined,
    deliveryStatus: row.delivery_status ?? undefined,
    drawingIds: row.drawing_ids ?? undefined,
    rfiIds: row.rfi_ids ?? undefined,
    submittalIds: row.submittal_ids ?? undefined,
    dependencies: row.dependencies ?? undefined,
    constraints: row.constraints ?? undefined,
    status: row.status,
    aiRiskIndicator: row.ai_risk_indicator ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Scheduling",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.projectId !== undefined) row.project_id = input.projectId;
  if (input.activityCode !== undefined) row.activity_code = input.activityCode;
  if (input.wbsPath !== undefined) row.wbs_path = input.wbsPath;
  if (input.name !== undefined) row.name = input.name;
  if (input.plannedStart !== undefined) row.planned_start = input.plannedStart;
  if (input.plannedFinish !== undefined) row.planned_finish = input.plannedFinish;
  if (input.actualStart !== undefined) row.actual_start = input.actualStart;
  if (input.actualFinish !== undefined) row.actual_finish = input.actualFinish;
  if (input.originalDurationDays !== undefined) row.original_duration_days = input.originalDurationDays;
  if (input.remainingDurationDays !== undefined) row.remaining_duration_days = input.remainingDurationDays;
  if (input.calendarId !== undefined) row.calendar_id = input.calendarId;
  if (input.isCritical !== undefined) row.is_critical = input.isCritical;
  if (input.percentComplete !== undefined) row.percent_complete = input.percentComplete;
  if (input.requiredManpower !== undefined) row.required_manpower = input.requiredManpower;
  if (input.status !== undefined) row.status = input.status;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<Activity>({
  table: "activities",
  seedData: MOCK_ACTIVITIES,
  fromRow,
  toRow,
  orderBy: "planned_start",
});

export const subscribeActivities = store.subscribe;
export const getActivitiesSnapshot = store.getSnapshot;

function nextActivityId(): string {
  const items = store.getSnapshot();
  const nums = items
    .map((a) => parseInt(a.id.replace("ACT-", ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `ACT-${(max + 1).toString().padStart(6, "0")}`;
}

export interface ActivityInput {
  projectId: string;
  name: string;
  plannedStart: string;
  plannedFinish: string;
  actualStart?: string;
  actualFinish?: string;
  requiredManpower?: number;
  status: ActivityStatus;
  isCritical: boolean;
}

function computeDurationDays(start: string, finish: string): number {
  const s = new Date(start + "T00:00:00");
  const f = new Date(finish + "T00:00:00");
  return Math.max(1, Math.round((f.getTime() - s.getTime()) / (24 * 60 * 60 * 1000)) + 1);
}

export function addActivity(input: ActivityInput, projectName: string) {
  const id = nextActivityId();
  const duration = computeDurationDays(input.plannedStart, input.plannedFinish);
  void store.create({
    id,
    activityCode: id,
    wbsPath: `${projectName} > ${input.name}`,
    originalDurationDays: duration,
    remainingDurationDays: input.status === "completed" ? 0 : duration,
    calendarId: "CAL-COMPANY",
    percentComplete: input.status === "completed" ? 100 : 0,
    ...input,
  });
}

export function updateActivity(id: string, input: ActivityInput) {
  const duration = computeDurationDays(input.plannedStart, input.plannedFinish);
  const existing = store.getSnapshot().find((a) => a.id === id);
  void store.update(id, {
    ...input,
    originalDurationDays: duration,
    percentComplete: input.status === "completed" ? 100 : existing?.percentComplete,
  });
}

export function deleteActivity(id: string) {
  void store.remove(id);
}
