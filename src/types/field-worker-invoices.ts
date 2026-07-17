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
  trade: string;
  billingEntityId?: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  lineItems: FieldWorkerInvoiceLineItem[];
  totalHours: number;
  totalAmount: number;
  generatedDate: string;
}
