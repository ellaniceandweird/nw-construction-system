"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_MAINTENANCE_TASKS } from "@/lib/data/mock/maintenance-tasks";
import { addMaintenanceLogEntry } from "@/lib/maintenance/maintenance-log-store";
import type {
  MaintenanceTask,
  MaintenancePriority,
  MaintenanceTaskStatus,
} from "@/types/maintenance";

function fromRow(row: Record<string, any>): MaintenanceTask {
  return {
    id: row.id,
    propertyId: row.property_id ?? undefined,
    propertyName: row.property_name ?? undefined,
    taskDescription: row.task_description,
    priority: row.priority ?? undefined,
    taskStatus: row.task_status,
    dateEntered: row.date_entered,
    plannedCompletionDate: row.planned_completion_date ?? undefined,
    dateCompleted: row.date_completed ?? undefined,
    responsibleParty: row.responsible_party ?? undefined,
    updateNotes: row.update_notes ?? undefined,
    comments: row.comments ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Maintenance",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.propertyName !== undefined) row.property_name = input.propertyName;
  if (input.taskDescription !== undefined) row.task_description = input.taskDescription;
  if (input.priority !== undefined) row.priority = input.priority;
  if (input.taskStatus !== undefined) row.task_status = input.taskStatus;
  if (input.dateEntered !== undefined) row.date_entered = input.dateEntered;
  if (input.plannedCompletionDate !== undefined) row.planned_completion_date = input.plannedCompletionDate;
  if (input.dateCompleted !== undefined) row.date_completed = input.dateCompleted;
  if (input.responsibleParty !== undefined) row.responsible_party = input.responsibleParty;
  if (input.comments !== undefined) row.comments = input.comments;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<MaintenanceTask>({
  table: "maintenance_tasks",
  seedData: MOCK_MAINTENANCE_TASKS,
  fromRow,
  toRow,
  orderBy: "date_entered",
});

export const subscribeMaintenanceTasks = store.subscribe;
export const getMaintenanceTasksSnapshot = store.getSnapshot;

function nextTaskId(): string {
  const items = store.getSnapshot();
  const nums = items
    .map((t) => parseInt(t.id.replace("MT-", ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `MT-${(max + 1).toString().padStart(6, "0")}`;
}

export interface MaintenanceTaskInput {
  propertyName: string;
  taskDescription: string;
  priority: MaintenancePriority;
  responsibleParty?: string;
  plannedCompletionDate?: string;
}

export function addMaintenanceTask(input: MaintenanceTaskInput) {
  const id = nextTaskId();
  void store.create({
    id,
    taskStatus: "not_started",
    dateEntered: new Date().toISOString().slice(0, 10),
    ...input,
  });
  return id;
}

export function updateTaskStatus(taskId: string, taskStatus: MaintenanceTaskStatus) {
  const existing = store.getSnapshot().find((t) => t.id === taskId);
  if (!existing) return;
  void store.update(taskId, {
    taskStatus,
    dateCompleted: taskStatus === "complete" ? new Date().toISOString().slice(0, 10) : existing.dateCompleted,
  });
  if (taskStatus === "complete" && existing.taskStatus !== "complete") {
    addMaintenanceLogEntry({
      type: "task_completed",
      propertyName: existing.propertyName,
      description: existing.taskDescription,
      detail: "Marked complete",
    });
  }
}

export interface MaintenanceTaskEditInput {
  propertyName?: string;
  taskDescription: string;
  priority?: MaintenancePriority;
  taskStatus: MaintenanceTaskStatus;
  responsibleParty?: string;
  plannedCompletionDate?: string;
  comments?: string;
}

export function updateTask(taskId: string, input: MaintenanceTaskEditInput) {
  const existing = store.getSnapshot().find((t) => t.id === taskId);
  if (!existing) return;
  void store.update(taskId, input);
  if (input.taskStatus === "complete" && existing.taskStatus !== "complete") {
    addMaintenanceLogEntry({
      type: "task_completed",
      propertyName: input.propertyName,
      description: input.taskDescription,
      detail: "Marked complete",
    });
  }
}

export function deleteMaintenanceTask(taskId: string) {
  void store.remove(taskId);
}

export function restoreMaintenanceTask(task: MaintenanceTask) {
  void store.create(task);
}
