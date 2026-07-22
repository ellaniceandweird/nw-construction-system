"use client";

import { MOCK_ACTIVITIES } from "@/lib/data/mock/activities";
import type { Activity, ActivityStatus } from "@/types/scheduling";

/**
 * Live Master Schedule data store.
 *
 * Per SDS §6.18, the Master Schedule is the ONLY place Activity data is
 * edited — every other view (16-week, 4-week, weekly, daily) is a
 * generated view over this exact array. This store is what makes that
 * real: it holds the live, editable Activity[] in memory, persists it to
 * localStorage so edits survive page reloads, and every scheduling page
 * subscribes to it via useActivities() instead of importing the static
 * mock array directly.
 *
 * This is explicitly a bridge, not the final architecture: Phase 8
 * (Excel read/write) replaces localStorage with real Excel file I/O, but
 * the shape of everything above this layer — the generation functions,
 * every page component — stays exactly the same, because they only ever
 * depend on "an Activity[] array from somewhere," never on how it's
 * stored.
 */

const STORAGE_KEY = "project-nw:activities";

type Listener = () => void;

let activities: Activity[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): Activity[] {
  if (typeof window === "undefined") return MOCK_ACTIVITIES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_ACTIVITIES;
    return JSON.parse(raw) as Activity[];
  } catch {
    return MOCK_ACTIVITIES;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeActivities(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getActivitiesSnapshot(): Activity[] {
  return activities;
}

function nextActivityId(): string {
  const nums = activities
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
  const now = new Date().toISOString();
  const duration = computeDurationDays(input.plannedStart, input.plannedFinish);
  const newActivity: Activity = {
    id: nextActivityId(),
    createdBy: "current-user",
    createdDate: now,
    lastModifiedBy: "current-user",
    lastModifiedDate: now,
    revisionNumber: 1,
    module: "Scheduling",
    projectId: input.projectId,
    activityCode: nextActivityId(),
    wbsPath: `${projectName} > ${input.name}`,
    name: input.name,
    plannedStart: input.plannedStart,
    plannedFinish: input.plannedFinish,
    actualStart: input.actualStart,
    actualFinish: input.actualFinish,
    originalDurationDays: duration,
    remainingDurationDays: input.status === "completed" ? 0 : duration,
    calendarId: "CAL-COMPANY",
    isCritical: input.isCritical,
    percentComplete: input.status === "completed" ? 100 : 0,
    requiredManpower: input.requiredManpower,
    status: input.status,
  };
  activities = [...activities, newActivity];
  persist();
  emit();
}

export function updateActivity(id: string, input: ActivityInput) {
  const duration = computeDurationDays(input.plannedStart, input.plannedFinish);
  activities = activities.map((a) =>
    a.id === id
      ? {
          ...a,
          projectId: input.projectId,
          name: input.name,
          plannedStart: input.plannedStart,
          plannedFinish: input.plannedFinish,
          actualStart: input.actualStart,
          actualFinish: input.actualFinish,
          originalDurationDays: duration,
          requiredManpower: input.requiredManpower,
          status: input.status,
          isCritical: input.isCritical,
          percentComplete: input.status === "completed" ? 100 : a.percentComplete,
          lastModifiedDate: new Date().toISOString(),
          lastModifiedBy: "current-user",
          revisionNumber: a.revisionNumber + 1,
        }
      : a
  );
  persist();
  emit();
}

export function deleteActivity(id: string) {
  activities = activities.filter((a) => a.id !== id);
  persist();
  emit();
}

export function resetActivitiesToMockData() {
  activities = MOCK_ACTIVITIES;
  persist();
  emit();
}
