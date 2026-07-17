"use client";

import { MOCK_DAILY_LOGS } from "@/lib/data/mock/daily-logs";
import type { DailyLog, WeatherCondition } from "@/types/field-operations";

const STORAGE_KEY = "project-nw:daily-logs";

type Listener = () => void;

let logs: DailyLog[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): DailyLog[] {
  if (typeof window === "undefined") return MOCK_DAILY_LOGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_DAILY_LOGS;
    return JSON.parse(raw) as DailyLog[];
  } catch {
    return MOCK_DAILY_LOGS;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeDailyLogs(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDailyLogsSnapshot(): DailyLog[] {
  return logs;
}

function nextLogId(): string {
  const nums = logs
    .map((l) => parseInt(l.id.replace("DL-", ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `DL-${(max + 1).toString().padStart(6, "0")}`;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export interface DailyLogInput {
  projectId: string;
  date: string;
  weatherCondition: WeatherCondition;
  preparedBy: string;
  crewAttendance: Array<{ crewName: string; trade: string; hoursWorked: number }>;
  activitiesPerformed: Array<{ activityId: string; description: string; hoursWorked: number; notes?: string }>;
  generalNotes?: string;
}

export const GENERAL_WORK_ACTIVITY_ID = "GENERAL_WORK";

export function addDailyLog(input: DailyLogInput) {
  const now = new Date().toISOString();
  const id = nextLogId();
  const newLog: DailyLog = {
    id,
    createdBy: "current-user",
    createdDate: now,
    lastModifiedBy: "current-user",
    lastModifiedDate: now,
    revisionNumber: 1,
    module: "Field Operations",
    status: "active",
    projectId: input.projectId,
    dailyLogNumber: id,
    date: input.date,
    dayOfWeek: DAY_NAMES[new Date(input.date + "T00:00:00").getDay()],
    preparedBy: input.preparedBy,
    weatherCondition: input.weatherCondition,
    crewAttendance: input.crewAttendance.map((c) => ({
      crewName: c.crewName,
      trade: c.trade,
      workersPresent: 1,
      workersAbsent: 0,
      workersLate: 0,
      hoursWorked: c.hoursWorked,
      overtimeHours: 0,
      workers: [
        {
          employeeId: `MANUAL-${c.crewName.replace(/\s+/g, "-").toUpperCase()}`,
          employeeName: c.crewName,
          trade: c.trade,
          regularHours: c.hoursWorked,
          overtimeHours: 0,
          status: "present",
        },
      ],
    })),
    activitiesPerformed: input.activitiesPerformed.map((a) => ({
      activityId: a.activityId,
      description: a.description,
      hoursWorked: a.hoursWorked,
      notes: a.notes,
      actualProgress: 0,
      percentComplete: 0,
      status: "in_progress",
    })),
    materialDeliveries: [],
    materialConsumption: [],
    generalNotes: input.generalNotes,
  };
  logs = [...logs, newLog];
  persist();
  emit();
  return id;
}

/** Updates a single crew member's hours on an existing log. */
export function updateCrewHours(logId: string, crewIndex: number, hoursWorked: number) {
  logs = logs.map((log) => {
    if (log.id !== logId) return log;
    const crewAttendance = log.crewAttendance.map((c, i) =>
      i === crewIndex ? { ...c, hoursWorked } : c
    );
    return { ...log, crewAttendance, lastModifiedDate: new Date().toISOString() };
  });
  persist();
  emit();
}

/** Adds a new crew member row to an existing log. */
export function addCrewMember(logId: string, crewName: string, trade: string, hoursWorked: number) {
  logs = logs.map((log) => {
    if (log.id !== logId) return log;
    return {
      ...log,
      crewAttendance: [
        ...log.crewAttendance,
        {
          crewName,
          trade,
          workersPresent: 1,
          workersAbsent: 0,
          workersLate: 0,
          hoursWorked,
          overtimeHours: 0,
          workers: [
            {
              employeeId: `MANUAL-${crewName.replace(/\s+/g, "-").toUpperCase()}`,
              employeeName: crewName,
              trade,
              regularHours: hoursWorked,
              overtimeHours: 0,
              status: "present" as const,
            },
          ],
        },
      ],
      lastModifiedDate: new Date().toISOString(),
    };
  });
  persist();
  emit();
}

export function removeCrewMember(logId: string, crewIndex: number) {
  logs = logs.map((log) => {
    if (log.id !== logId) return log;
    return {
      ...log,
      crewAttendance: log.crewAttendance.filter((_, i) => i !== crewIndex),
      lastModifiedDate: new Date().toISOString(),
    };
  });
  persist();
  emit();
}

/** Adds a new activity row to an existing log. */
export function addActivityToLog(logId: string, description: string, hoursWorked: number) {
  logs = logs.map((log) => {
    if (log.id !== logId) return log;
    return {
      ...log,
      activitiesPerformed: [
        ...log.activitiesPerformed,
        {
          activityId: "MANUAL-ENTRY",
          description,
          hoursWorked,
          actualProgress: 0,
          percentComplete: 0,
          status: "in_progress" as const,
        },
      ],
      lastModifiedDate: new Date().toISOString(),
    };
  });
  persist();
  emit();
}

/** Toggles an activity between "in progress" and "completed" (100%). */
export function toggleActivityComplete(logId: string, activityIndex: number) {
  logs = logs.map((log) => {
    if (log.id !== logId) return log;
    const activitiesPerformed = log.activitiesPerformed.map((a, i) => {
      if (i !== activityIndex) return a;
      const nowComplete = a.percentComplete < 100;
      return {
        ...a,
        percentComplete: nowComplete ? 100 : 0,
        status: nowComplete ? "completed" : "in_progress",
      };
    });
    return { ...log, activitiesPerformed, lastModifiedDate: new Date().toISOString() };
  });
  persist();
  emit();
}

export function removeActivityFromLog(logId: string, activityIndex: number) {
  logs = logs.map((log) => {
    if (log.id !== logId) return log;
    return {
      ...log,
      activitiesPerformed: log.activitiesPerformed.filter((_, i) => i !== activityIndex),
      lastModifiedDate: new Date().toISOString(),
    };
  });
  persist();
  emit();
}
