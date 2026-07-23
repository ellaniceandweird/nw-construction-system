"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_TEAM_ASSIGNMENTS } from "@/lib/data/mock/team-assignments";
import type { TeamAssignment } from "@/types/project";

function fromRow(row: Record<string, any>): TeamAssignment {
  return {
    id: row.id,
    projectId: row.project_id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    role: row.role,
    department: row.department ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    assignmentStartDate: row.assignment_start_date,
    assignmentEndDate: row.assignment_end_date ?? undefined,
    availability: row.availability ?? undefined,
    isActive: row.is_active ?? true,
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
  if (input.employeeId !== undefined) row.employee_id = input.employeeId;
  if (input.employeeName !== undefined) row.employee_name = input.employeeName;
  if (input.role !== undefined) row.role = input.role;
  if (input.department !== undefined) row.department = input.department;
  if (input.email !== undefined) row.email = input.email;
  if (input.phone !== undefined) row.phone = input.phone;
  if (input.assignmentStartDate !== undefined) row.assignment_start_date = input.assignmentStartDate;
  if (input.assignmentEndDate !== undefined) row.assignment_end_date = input.assignmentEndDate;
  if (input.availability !== undefined) row.availability = input.availability;
  if (input.isActive !== undefined) row.is_active = input.isActive;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<TeamAssignment>({
  table: "team_assignments",
  seedData: MOCK_TEAM_ASSIGNMENTS,
  fromRow,
  toRow,
  orderBy: "assignment_start_date",
});

export const subscribeTeamAssignments = store.subscribe;
export const getTeamAssignmentsSnapshot = store.getSnapshot;
