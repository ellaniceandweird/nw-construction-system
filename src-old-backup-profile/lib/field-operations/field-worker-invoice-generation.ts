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
 * Scans real Daily Log crew attendance for the given pay period and
 * builds one draft invoice per employee who has hours in that window,
 * with a line item per day/project. Rates come from References > Field
 * Worker Rates — a worker with no rate on file gets 0 (visible in the
 * preview so it can't slip through silently).
 */
export function generateFieldWorkerInvoices(
  dailyLogs: DailyLog[],
  rates: FieldWorkerRate[],
  options: GenerateOptions
): Omit<FieldWorkerInvoice, "id" | "createdBy" | "createdDate" | "lastModifiedBy" | "lastModifiedDate" | "revisionNumber" | "module" | "status" | "invoiceNumber">[] {
  const byEmployee = new Map<string, { name: string; trade: string; lineItems: FieldWorkerInvoiceLineItem[] }>();

  const logsInRange = dailyLogs.filter((log) => inRange(log.date, options.payPeriodStart, options.payPeriodEnd));

  for (const log of logsInRange) {
    for (const crew of log.crewAttendance) {
      for (const worker of crew.workers) {
        if (worker.status === "absent") continue;
        const rate = rates.find((r) => r.employeeId === worker.employeeId);
        const regularRate = rate?.hourlyRate ?? 0;
        const overtimeRate = rate?.overtimeRate ?? regularRate * 1.5;

        const lineItem: FieldWorkerInvoiceLineItem = {
          date: log.date,
          projectId: log.projectId,
          costCode: rate?.defaultCostCode,
          regularHours: worker.regularHours,
          overtimeHours: worker.overtimeHours,
          regularRate,
          overtimeRate,
          amount: worker.regularHours * regularRate + worker.overtimeHours * overtimeRate,
        };

        if (!byEmployee.has(worker.employeeId)) {
          byEmployee.set(worker.employeeId, { name: worker.employeeName, trade: worker.trade, lineItems: [] });
        }
        byEmployee.get(worker.employeeId)!.lineItems.push(lineItem);
      }
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
