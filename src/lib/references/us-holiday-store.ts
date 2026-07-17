"use client";
import { MOCK_US_HOLIDAYS } from "@/lib/data/mock/us-holidays";
import type { USHoliday } from "@/types/references";

const STORAGE_KEY = "project-nw:us-holidays";
type Listener = () => void;
let holidays: USHoliday[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): USHoliday[] {
  if (typeof window === "undefined") return MOCK_US_HOLIDAYS;
  try { const raw = window.localStorage.getItem(STORAGE_KEY); if (!raw) return MOCK_US_HOLIDAYS; return JSON.parse(raw) as USHoliday[]; } catch { return MOCK_US_HOLIDAYS; }
}
function persist() { if (typeof window === "undefined") return; window.localStorage.setItem(STORAGE_KEY, JSON.stringify(holidays)); }
function emit() { listeners.forEach((l) => l()); }
function nextId(): string {
  const maxNum = holidays.reduce((max, h) => { const n = parseInt(h.id.replace("HOL-", ""), 10); return Number.isFinite(n) ? Math.max(max, n) : max; }, 0);
  return `HOL-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeUSHolidays(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function getUSHolidaysSnapshot(): USHoliday[] { return holidays; }

export interface USHolidayInput { name: string; date: string; notes?: string; }

export function createUSHoliday(input: USHolidayInput) {
  const now = new Date().toISOString();
  const newHoliday: USHoliday = { id: nextId(), createdBy: "user", createdDate: now, lastModifiedBy: "user", lastModifiedDate: now, revisionNumber: 1, module: "References", status: "active", ...input };
  holidays = [...holidays, newHoliday];
  persist(); emit();
  return newHoliday;
}
export function updateUSHoliday(id: string, input: USHolidayInput) {
  holidays = holidays.map((h) => h.id === id ? { ...h, ...input, lastModifiedDate: new Date().toISOString() } : h);
  persist(); emit();
}
export function deleteUSHoliday(id: string) {
  holidays = holidays.filter((h) => h.id !== id);
  persist(); emit();
}
