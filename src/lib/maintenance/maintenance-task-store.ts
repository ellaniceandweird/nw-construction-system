"use client";

import { MOCK_MAINTENANCE_TASKS } from "@/lib/data/mock/maintenance-tasks";
import type {
  MaintenanceTask,
  MaintenancePriority,
  MaintenanceTaskStatus,
} from "@/types/maintenance";

const STORAGE_KEY = "project-nw:maintenance-tasks";

type Listener = () => void;

let tasks: MaintenanceTask[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): MaintenanceTask[] {
  if (typeof window === "undefined") return MOCK_MAINTENANCE_TASKS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_MAINTENANCE_TASKS;
    return JSON.parse(raw) as MaintenanceTask[];
  } catch {
    return MOCK_MAINTENANCE_TASKS;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeMaintenanceTasks(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMaintenanceTasksSnapshot(): MaintenanceTask[] {
  return tasks;
}

function nextTaskId(): string {
  const nums = tasks
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
  const now = new Date().toISOString();
  const id = nextTaskId();
  const newTask: MaintenanceTask = {
    id,
    createdBy: "current-user",
    createdDate: now,
    lastModifiedBy: "current-user",
    lastModifiedDate: now,
    revisionNumber: 1,
    module: "Maintenance",
    status: "active",
    propertyName: input.propertyName,
    taskDescription: input.taskDescription,
    priority: input.priority,
    taskStatus: "not_started",
    dateEntered: now.slice(0, 10),
    plannedCompletionDate: input.plannedCompletionDate,
    responsibleParty: input.responsibleParty,
  };
  tasks = [...tasks, newTask];
  persist();
  emit();
  return id;
}

export function updateTaskStatus(taskId: string, taskStatus: MaintenanceTaskStatus) {
  tasks = tasks.map((t) =>
    t.id === taskId
      ? {
          ...t,
          taskStatus,
          dateCompleted: taskStatus === "complete" ? new Date().toISOString().slice(0, 10) : t.dateCompleted,
          lastModifiedDate: new Date().toISOString(),
        }
      : t
  );
  persist();
  emit();
}
