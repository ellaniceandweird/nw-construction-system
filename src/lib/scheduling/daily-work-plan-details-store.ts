"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import type { DailyWorkPlanDetails, CrewAttendanceEntry, TaskAssignmentEntry, ProcurementNeedEntry } from "@/types/daily-work-plan-details";

const SEED_DATA: DailyWorkPlanDetails[] = [];

function fromRow(row: Record<string, any>): DailyWorkPlanDetails {
  return {
    id: row.id,
    date: row.date,
    crewAttendance: row.crew_attendance ?? [],
    taskAssignments: row.task_assignments ?? [],
    procurementNeeds: row.procurement_needs ?? [],
    equipmentNeeded: row.equipment_needed ?? undefined,
    rainPlan: row.rain_plan ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Scheduling",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.date !== undefined) row.date = input.date;
  if (input.crewAttendance !== undefined) row.crew_attendance = input.crewAttendance;
  if (input.taskAssignments !== undefined) row.task_assignments = input.taskAssignments;
  if (input.procurementNeeds !== undefined) row.procurement_needs = input.procurementNeeds;
  if (input.equipmentNeeded !== undefined) row.equipment_needed = input.equipmentNeeded;
  if (input.rainPlan !== undefined) row.rain_plan = input.rainPlan;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<DailyWorkPlanDetails>({
  table: "daily_work_plan_details",
  seedData: SEED_DATA,
  fromRow,
  toRow,
  orderBy: "date",
});

export const subscribeDailyWorkPlanDetails = store.subscribe;
export const getDailyWorkPlanDetailsSnapshot = store.getSnapshot;

export interface DailyWorkPlanDetailsInput {
  date: string;
  crewAttendance?: CrewAttendanceEntry[];
  taskAssignments?: TaskAssignmentEntry[];
  procurementNeeds?: ProcurementNeedEntry[];
  equipmentNeeded?: string;
  rainPlan?: string;
}

function idForDate(date: string): string {
  return `DWP-${date}`;
}

export function getDetailsForDate(date: string): DailyWorkPlanDetails | undefined {
  return store.getSnapshot().find((d) => d.date === date);
}

export async function upsertDailyWorkPlanDetails(input: DailyWorkPlanDetailsInput): Promise<{ ok: boolean; error?: string }> {
  const existing = getDetailsForDate(input.date);
  if (existing) {
    const ok = await store.update(existing.id, input);
    return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
  }
  const id = idForDate(input.date);
  const result = await store.create({
    id,
    crewAttendance: [],
    taskAssignments: [],
    procurementNeeds: [],
    ...input,
  });
  return result !== null ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}
