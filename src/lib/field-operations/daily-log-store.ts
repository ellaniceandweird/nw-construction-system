"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_DAILY_LOGS } from "@/lib/data/mock/daily-logs";
import type { DailyLog, DailyTimeEntry, WeatherCondition } from "@/types/field-operations";

function fromRow(row: Record<string, any>): DailyLog {
  return {
    id: row.id,
    projectId: row.project_id,
    dailyLogNumber: row.daily_log_number,
    date: row.date,
    dayOfWeek: row.day_of_week,
    preparedBy: row.prepared_by,
    reviewedBy: row.reviewed_by ?? undefined,
    superintendent: row.superintendent ?? undefined,
    projectEngineer: row.project_engineer ?? undefined,
    weatherCondition: row.weather_condition,
    temperature: row.temperature != null ? Number(row.temperature) : undefined,
    wind: row.wind ?? undefined,
    humidity: row.humidity != null ? Number(row.humidity) : undefined,
    workingHours: row.working_hours ?? undefined,
    shift: row.shift ?? undefined,
    overallSiteStatus: row.overall_site_status ?? undefined,
    timeEntries: row.time_entries ?? [],
    materialDeliveries: row.material_deliveries ?? [],
    materialConsumption: row.material_consumption ?? [],
    generalNotes: row.general_notes ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Field Operations",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.projectId !== undefined) row.project_id = input.projectId;
  if (input.dailyLogNumber !== undefined) row.daily_log_number = input.dailyLogNumber;
  if (input.date !== undefined) row.date = input.date;
  if (input.dayOfWeek !== undefined) row.day_of_week = input.dayOfWeek;
  if (input.preparedBy !== undefined) row.prepared_by = input.preparedBy;
  if (input.weatherCondition !== undefined) row.weather_condition = input.weatherCondition;
  if (input.timeEntries !== undefined) row.time_entries = input.timeEntries;
  if (input.materialDeliveries !== undefined) row.material_deliveries = input.materialDeliveries;
  if (input.materialConsumption !== undefined) row.material_consumption = input.materialConsumption;
  if (input.generalNotes !== undefined) row.general_notes = input.generalNotes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<DailyLog>({
  table: "daily_logs",
  seedData: MOCK_DAILY_LOGS,
  fromRow,
  toRow,
  orderBy: "date",
});

export const subscribeDailyLogs = store.subscribe;
export const getDailyLogsSnapshot = store.getSnapshot;

function nextLogId(): string {
  const nums = store
    .getSnapshot()
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
export const MANUAL_ACTIVITY_ID = "MANUAL_ENTRY";
export const MANUAL_ENTRY = "__manual__";

/** Returns the most recent daily log strictly before the given date, if any. */
export function getMostRecentLog(beforeDate: string): DailyLog | undefined {
  const priorLogs = store
    .getSnapshot()
    .filter((l) => l.date < beforeDate)
    .sort((a, b) => b.date.localeCompare(a.date));
  return priorLogs[0];
}

/**
 * Returns the crew (unique employeeIds) from the most recent daily log
 * before the given date, so a new log can pre-fill "who's probably
 * working today" — Ella just adjusts project/activity/hours instead of
 * re-picking the same people every morning.
 */
export function getMostRecentCrew(beforeDate: string): DailyTimeEntry[] {
  const mostRecent = getMostRecentLog(beforeDate);
  if (!mostRecent) return [];
  const seen = new Set<string>();
  const result: DailyTimeEntry[] = [];
  for (const entry of mostRecent.timeEntries) {
    if (seen.has(entry.employeeId)) continue;
    seen.add(entry.employeeId);
    result.push(entry);
  }
  return result;
}

export function addDailyLog(input: DailyLogInput) {
  const id = nextLogId();
  void store.create({
    id,
    dailyLogNumber: id,
    dayOfWeek: DAY_NAMES[new Date(input.date + "T00:00:00").getDay()],
    materialDeliveries: [],
    materialConsumption: [],
    ...input,
  });
  return id;
}

/** Updates one time entry's hours/notes on an existing log. */
export function updateTimeEntry(logId: string, entryIndex: number, patch: Partial<DailyTimeEntry>) {
  const log = store.getSnapshot().find((l) => l.id === logId);
  if (!log) return;
  const timeEntries = log.timeEntries.map((e, i) => (i === entryIndex ? { ...e, ...patch } : e));
  void store.update(logId, { timeEntries });
}

/** Adds a new time entry row to an existing log. */
export function addTimeEntry(logId: string, entry: DailyTimeEntry) {
  const log = store.getSnapshot().find((l) => l.id === logId);
  if (!log) return;
  void store.update(logId, { timeEntries: [...log.timeEntries, entry] });
}

export function removeTimeEntry(logId: string, entryIndex: number) {
  const log = store.getSnapshot().find((l) => l.id === logId);
  if (!log) return;
  void store.update(logId, { timeEntries: log.timeEntries.filter((_, i) => i !== entryIndex) });
}
