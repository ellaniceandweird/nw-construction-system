import type { BaseEntity } from "@/types/common";

/**
 * Field Worker Invoices — auto-generated from real Daily Log crew
 * attendance for a chosen pay period. One invoice per employee, with a
 * line item per day/project they worked, using their rate from
 * References > Field Worker Rates.
 */
export interface FieldWorkerInvoiceLineItem {
  date: string;
  projectId: string;
  /** What was actually typed for a manual (non-schedule-linked) project entry — the display fallback whenever projectId doesn't resolve to a real Project. */
  projectName?: string;
  /** Derived from the project's property's billing entity — per line item, since one worker can cross projects/billing entities within a pay period. */
  billingEntityId?: string;
  activity: string;
  costCode?: string;
  regularHours: number;
  overtimeHours: number;
  regularRate: number;
  overtimeRate: number;
  amount: number;
}

export interface FieldWorkerInvoice extends BaseEntity {
  invoiceNumber: string;
  employeeId: string;
  employeeName: string;
  trade?: string;
  billingEntityId?: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  paymentDueDate?: string;
  /** Whether to show the OT Hrs / OT Rate columns when printed. Undefined means "decide automatically based on whether any line item actually has overtime hours." */
  showOvertimeColumns?: boolean;
  lineItems: FieldWorkerInvoiceLineItem[];
  totalHours: number;
  totalAmount: number;
  generatedDate: string;
}
