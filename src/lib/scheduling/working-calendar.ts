import type { USHoliday } from "@/types/references";

/**
 * The Planning module's working calendar — no work scheduled on
 * Saturdays, Sundays, or US Holidays (as listed in References > US
 * Holidays). Used both for duration math (so "5 days" means 5 *working*
 * days) and for visually shading non-working days in the schedule grids.
 */
export function isWorkingDay(date: Date, holidays: USHoliday[]): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) return false; // Sunday, Saturday
  const dateStr = toDateStr(date);
  return !holidays.some((h) => h.date === dateStr);
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Counts working days between two dates (inclusive of both ends), excluding weekends/holidays. */
export function countWorkingDays(startStr: string, finishStr: string, holidays: USHoliday[]): number {
  const start = new Date(startStr + "T00:00:00");
  const finish = new Date(finishStr + "T00:00:00");
  if (finish < start) return 0;
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= finish) {
    if (isWorkingDay(cursor, holidays)) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}
