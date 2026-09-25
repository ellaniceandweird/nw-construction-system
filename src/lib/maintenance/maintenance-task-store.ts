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
  if (input.dateEntered !== undefined) row.date_entered = input.dateEntered || null;
  if (input.plannedCompletionDate !== undefined) row.planned_completion_date = input.plannedCompletionDate || null;
  if (input.dateCompleted !== undefined) row.date_completed = input.dateCompleted || null;
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
  taskStatus?: MaintenanceTaskStatus;
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

/**
 * Adds many tasks at once (bulk paste / import). IDs are computed once
 * upfront and incremented locally in this loop rather than calling
 * nextTaskId() repeatedly — the store's snapshot doesn't reflect an
 * in-flight create until it resolves, so a tight loop of nextTaskId()
 * calls risks generating the same ID twice and colliding.
 */
/**
 * Imports many tasks at once (bulk paste / import), matching each
 * incoming row against existing tasks by Property + Task Description
 * (case-insensitive) so re-importing an updated Google Sheet supersedes
 * the matching existing row instead of creating a duplicate. Rows that
 * don't match anything existing are added as new. IDs for genuinely new
 * rows are computed once upfront and incremented locally, avoiding the
 * same collision risk a tight loop of nextTaskId() calls would have.
 */
export async function addMaintenanceTasksBulk(inputs: MaintenanceTaskInput[]): Promise<{ added: number; updated: number; failed: { row: number; error?: string }[] }> {
  const items = store.getSnapshot();
  let maxNum = items.reduce((max, t) => {
    const n = parseInt(t.id.replace("MT-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);

  function matchKey(propertyName: string | undefined, taskDescription: string) {
    return `${(propertyName ?? "").trim().toLowerCase()}|${taskDescription.trim().toLowerCase()}`;
  }
  const existingByKey = new Map(items.map((t) => [matchKey(t.propertyName, t.taskDescription), t]));

  const failed: { row: number; error?: string }[] = [];
  let added = 0;
  let updated = 0;
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const resolvedStatus = input.taskStatus ?? "not_started";
    const existing = existingByKey.get(matchKey(input.propertyName, input.taskDescription));
    if (existing) {
      const wasComplete = existing.taskStatus === "complete";
      const nowComplete = resolvedStatus === "complete";
      const result = await store.update(existing.id, {
        ...input,
        taskStatus: resolvedStatus,
        dateCompleted: nowComplete ? (existing.dateCompleted ?? new Date().toISOString().slice(0, 10)) : existing.dateCompleted,
      });
      if (result) {
        updated++;
        // Only log a fresh completion, not every re-import of an
        // already-completed row — otherwise re-importing the same
        // sheet would spam the log with duplicate "completed" entries.
        if (nowComplete && !wasComplete) {
          addMaintenanceLogEntry({
            type: "task_completed",
            propertyName: input.propertyName,
            description: input.taskDescription,
            detail: "Marked complete (import)",
          });
        }
      } else {
        failed.push({ row: i + 1, error: store.getLastError() ?? undefined });
      }
      continue;
    }
    maxNum += 1;
    const id = `MT-${String(maxNum).padStart(6, "0")}`;
    const result = await store.create({
      id,
      dateEntered: new Date().toISOString().slice(0, 10),
      ...input,
      taskStatus: resolvedStatus,
      dateCompleted: resolvedStatus === "complete" ? new Date().toISOString().slice(0, 10) : undefined,
    });
    if (result !== null) {
      added++;
      if (resolvedStatus === "complete") {
        addMaintenanceLogEntry({
          type: "task_completed",
          propertyName: input.propertyName,
          description: input.taskDescription,
          detail: "Marked complete (import)",
        });
      }
    } else {
      failed.push({ row: i + 1, error: store.getLastError() ?? undefined });
    }
  }
  return { added, updated, failed };
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

export async function updateTask(taskId: string, input: MaintenanceTaskEditInput): Promise<{ ok: boolean; error?: string }> {
  const existing = store.getSnapshot().find((t) => t.id === taskId);
  if (!existing) return { ok: false, error: "Task not found" };
  const ok = await store.update(taskId, input);
  if (!ok) return { ok: false, error: store.getLastError() ?? undefined };
  if (input.taskStatus === "complete" && existing.taskStatus !== "complete") {
    addMaintenanceLogEntry({
      type: "task_completed",
      propertyName: input.propertyName,
      description: input.taskDescription,
      detail: "Marked complete",
    });
  }
  return { ok: true };
}

export function deleteMaintenanceTask(taskId: string) {
  void store.remove(taskId);
}

export function restoreMaintenanceTask(task: MaintenanceTask) {
  void store.create(task);
}
