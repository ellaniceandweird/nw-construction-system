import type { ActivityStatus } from "@/types/scheduling";
import type { Project } from "@/types/project";

/**
 * A single row extracted from an uploaded Excel or PDF file, before the
 * person has reviewed/corrected it. Nothing gets written to the Master
 * Schedule until they explicitly confirm the review step — this is just
 * the "here's what we found" staging shape.
 */
export interface ParsedActivityRow {
  rowId: string;
  projectNameRaw: string;
  matchedProjectId: string | null;
  activityName: string;
  plannedStart: string; // ISO yyyy-mm-dd, "" if unparseable
  plannedFinish: string; // ISO yyyy-mm-dd, "" if unparseable
  requiredManpower?: number;
  status: ActivityStatus;
  /** Whether this row is included in the final import (person can uncheck). */
  include: boolean;
  /** Problems found during parsing — shown to the person before they confirm. */
  warnings: string[];
}

/** Best-effort fuzzy match of a free-text project name against the real project list. */
export function matchProjectName(raw: string, projects: Project[]): string | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return null;

  // Exact match first
  const exact = projects.find((p) => p.projectName.toLowerCase() === normalized);
  if (exact) return exact.id;

  // Substring match either direction
  const partial = projects.find(
    (p) =>
      p.projectName.toLowerCase().includes(normalized) ||
      normalized.includes(p.projectName.toLowerCase())
  );
  if (partial) return partial.id;

  // Match by street address, since sources often reference the property not the project name
  const byAddress = projects.find((p) =>
    normalized.includes(p.address.street.toLowerCase())
  );
  if (byAddress) return byAddress.id;

  return null;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/** Parses a wide variety of common date string formats into ISO yyyy-mm-dd. */
export function parseDateFlexible(value: unknown): string {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  if (typeof value === "number") {
    // Excel serial date
    const epoch = new Date(1899, 11, 30);
    const d = new Date(epoch.getTime() + value * 24 * 60 * 60 * 1000);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    // yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    // mm/dd/yyyy or m/d/yyyy
    const mdy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (mdy) {
      const [, m, d, y] = mdy;
      const year = y.length === 2 ? `20${y}` : y;
      return `${year}-${pad(parseInt(m))}-${pad(parseInt(d))}`;
    }
    // Fallback to native Date parsing (e.g. "Jul 10, 2026", "July 10 2026")
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
    }
  }
  return "";
}
