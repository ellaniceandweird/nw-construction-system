"use client";

import { MOCK_DAILY_LOGS } from "@/lib/data/mock/daily-logs";
import type { DailyLog, DailyTimeEntry, WeatherCondition } from "@/types/field-operations";

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
  timeEntries: DailyTimeEntry[];
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
    timeEntries: input.timeEntries,
    materialDeliveries: [],
    materialConsumption: [],
    generalNotes: input.generalNotes,
  };
  logs = [...logs, newLog];
  persist();
  emit();
  return id;
}

/** Updates one time entry's hours/notes on an existing log. */
export function updateTimeEntry(logId: string, entryIndex: number, patch: Partial<DailyTimeEntry>) {
  logs = logs.map((log) => {
    if (log.id !== logId) return log;
    const timeEntries = log.timeEntries.map((e, i) => (i === entryIndex ? { ...e, ...patch } : e));
    return { ...log, timeEntries, lastModifiedDate: new Date().toISOString() };
  });
  persist();
  emit();
}

/** Adds a new time entry row to an existing log. */
export function addTimeEntry(logId: string, entry: DailyTimeEntry) {
  logs = logs.map((log) => {
    if (log.id !== logId) return log;
    return {
      ...log,
      timeEntries: [...log.timeEntries, entry],
      lastModifiedDate: new Date().toISOString(),
    };
  });
  persist();
  emit();
}

export function removeTimeEntry(logId: string, entryIndex: number) {
  logs = logs.map((log) => {
    if (log.id !== logId) return log;
    return {
      ...log,
      timeEntries: log.timeEntries.filter((_, i) => i !== entryIndex),
      lastModifiedDate: new Date().toISOString(),
    };
  });
  persist();
  emit();
}
