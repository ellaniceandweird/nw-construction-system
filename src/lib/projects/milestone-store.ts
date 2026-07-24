"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_MILESTONES } from "@/lib/data/mock/milestones";
import type { Milestone } from "@/types/project";

function fromRow(row: Record<string, any>): Milestone {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description ?? undefined,
    plannedDate: row.planned_date,
    forecastDate: row.forecast_date ?? undefined,
    actualDate: row.actual_date ?? undefined,
    responsiblePerson: row.responsible_person ?? undefined,
    dependencyIds: row.dependency_ids ?? undefined,
    completionPercent: Number(row.completion_percent ?? 0),
    notes: row.notes ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Project Management",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.projectId !== undefined) row.project_id = input.projectId;
  if (input.name !== undefined) row.name = input.name;
  if (input.description !== undefined) row.description = input.description;
  if (input.plannedDate !== undefined) row.planned_date = input.plannedDate;
  if (input.forecastDate !== undefined) row.forecast_date = input.forecastDate;
  if (input.actualDate !== undefined) row.actual_date = input.actualDate;
  if (input.responsiblePerson !== undefined) row.responsible_person = input.responsiblePerson;
  if (input.dependencyIds !== undefined) row.dependency_ids = input.dependencyIds;
  if (input.completionPercent !== undefined) row.completion_percent = input.completionPercent;
  if (input.notes !== undefined) row.notes = input.notes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<Milestone>({
  table: "milestones",
  seedData: MOCK_MILESTONES,
  fromRow,
  toRow,
  orderBy: "planned_date",
});

export const subscribeMilestones = store.subscribe;
export const getMilestonesSnapshot = store.getSnapshot;
