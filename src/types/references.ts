import type { BaseEntity } from "@/types/common";

/**
 * References Module — shared lookup/reference data used across other
 * modules (Field Worker Invoices reads rates from here; other modules
 * reuse the EXACT SAME stores as Financial's Billing Entities and
 * Estimating's Cost Codes rather than duplicating them, so there's one
 * real source of truth either way).
 */
export interface FieldWorkerRate extends BaseEntity {
  employeeId: string;
  employeeName: string;
  trade: string;
  hourlyRate: number;
  overtimeRate?: number;
  /** When this worker started with the company — used to compute "months with us" live, never stored as a separate number so it can never drift out of date. */
  startDate?: string;
  /** The date of this worker's most recent rate increase — set automatically whenever hourlyRate is changed to a new value, so it can never fall out of sync with an actual raise. */
  lastRaiseDate?: string;
  /** What hourlyRate was immediately before the most recent raise — set automatically alongside lastRaiseDate. */
  previousRate?: number;
  /** Total PTO hours this worker has used — entered manually, not derived from anything else. */
  ptoUsedHours?: number;
  notes?: string;
}

export interface USHoliday extends BaseEntity {
  name: string;
  date: string; // yyyy-mm-dd, specific to one year
  notes?: string;
}
