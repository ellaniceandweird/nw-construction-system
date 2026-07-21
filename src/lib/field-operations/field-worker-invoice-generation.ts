import type { DailyLog } from "@/types/field-operations";
import type { FieldWorkerRate } from "@/types/references";
import type { FieldWorkerInvoice, FieldWorkerInvoiceLineItem } from "@/types/field-worker-invoices";

interface GenerateOptions {
  payPeriodStart: string;
  payPeriodEnd: string;
  billingEntityId?: string;
}

function inRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

/**
 * Scans real Daily Log time entries for the given pay period and builds
 * one draft invoice per employee who has hours in that window, with a
 * line item per day/project/activity they worked. Rates come from
 * References > Field Worker Rates — a worker with no rate on file gets
 * 0 (visible in the preview so it can't slip through silently). This is
 * simpler than the old crew/worker nesting since a time entry already
 * carries its own project and activity directly.
 */
export function generateFieldWorkerInvoices(
  dailyLogs: DailyLog[],
  rates: FieldWorkerRate[],
  options: GenerateOptions
): Omit<FieldWorkerInvoice, "id" | "createdBy" | "createdDate" | "lastModifiedBy" | "lastModifiedDate" | "revisionNumber" | "module" | "status" | "invoiceNumber">[] {
  const byEmployee = new Map<string, { name: string; trade?: string; lineItems: FieldWorkerInvoiceLineItem[] }>();

  const logsInRange = dailyLogs.filter((log) => inRange(log.date, options.payPeriodStart, options.payPeriodEnd));

  for (const log of logsInRange) {
    for (const entry of log.timeEntries) {
      if (entry.status === "absent") continue;
      const rate = rates.find((r) => r.employeeId === entry.employeeId);
      const regularRate = rate?.hourlyRate ?? 0;
      const overtimeRate = rate?.overtimeRate ?? regularRate * 1.5;

      const lineItem: FieldWorkerInvoiceLineItem = {
        date: log.date,
        projectId: entry.projectId,
        activity: entry.activityDescription || "General Work",
        costCode: rate?.defaultCostCode,
        regularHours: entry.regularHours,
        overtimeHours: entry.overtimeHours,
        regularRate,
        overtimeRate,
        amount: entry.regularHours * regularRate + entry.overtimeHours * overtimeRate,
      };

      if (!byEmployee.has(entry.employeeId)) {
        byEmployee.set(entry.employeeId, { name: entry.employeeName, trade: entry.trade, lineItems: [] });
      }
      byEmployee.get(entry.employeeId)!.lineItems.push(lineItem);
    }
  }

  const invoices: Omit<FieldWorkerInvoice, "id" | "createdBy" | "createdDate" | "lastModifiedBy" | "lastModifiedDate" | "revisionNumber" | "module" | "status" | "invoiceNumber">[] = [];
  for (const [employeeId, data] of byEmployee) {
    const totalHours = data.lineItems.reduce((sum, li) => sum + li.regularHours + li.overtimeHours, 0);
    const totalAmount = data.lineItems.reduce((sum, li) => sum + li.amount, 0);
    invoices.push({
      employeeId,
      employeeName: data.name,
      trade: data.trade,
      billingEntityId: options.billingEntityId,
      payPeriodStart: options.payPeriodStart,
      payPeriodEnd: options.payPeriodEnd,
      lineItems: data.lineItems.sort((a, b) => a.date.localeCompare(b.date)),
      totalHours,
      totalAmount,
      generatedDate: new Date().toISOString(),
    });
  }

  return invoices.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
}
