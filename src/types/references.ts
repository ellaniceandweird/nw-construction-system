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
  defaultCostCode?: string;
  notes?: string;
}

export interface USHoliday extends BaseEntity {
  name: string;
  date: string; // yyyy-mm-dd, specific to one year
  notes?: string;
}
