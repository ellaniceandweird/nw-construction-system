"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import type { FieldWorkerInvoice } from "@/types/field-worker-invoices";

function fromRow(row: Record<string, any>): FieldWorkerInvoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    trade: row.trade ?? undefined,
    billingEntityId: row.billing_entity_id ?? undefined,
    payPeriodStart: row.pay_period_start,
    payPeriodEnd: row.pay_period_end,
    lineItems: row.line_items ?? [],
    totalHours: Number(row.total_hours ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
    generatedDate: row.generated_date ?? new Date().toISOString(),
    paymentDueDate: row.payment_due_date ?? undefined,
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
  if (input.invoiceNumber !== undefined) row.invoice_number = input.invoiceNumber;
  if (input.employeeId !== undefined) row.employee_id = input.employeeId;
  if (input.employeeName !== undefined) row.employee_name = input.employeeName;
  if (input.trade !== undefined) row.trade = input.trade;
  if (input.billingEntityId !== undefined) row.billing_entity_id = input.billingEntityId;
  if (input.payPeriodStart !== undefined) row.pay_period_start = input.payPeriodStart || null;
  if (input.payPeriodEnd !== undefined) row.pay_period_end = input.payPeriodEnd;
  if (input.lineItems !== undefined) row.line_items = input.lineItems;
  if (input.totalHours !== undefined) row.total_hours = input.totalHours;
  if (input.totalAmount !== undefined) row.total_amount = input.totalAmount;
  if (input.generatedDate !== undefined) row.generated_date = input.generatedDate || null;
  if (input.paymentDueDate !== undefined) row.payment_due_date = input.paymentDueDate || null;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<FieldWorkerInvoice>({
  table: "field_worker_invoices",
  seedData: [],
  fromRow,
  toRow,
  orderBy: "pay_period_end",
});

export const subscribeFieldWorkerInvoices = store.subscribe;
export const getFieldWorkerInvoicesSnapshot = store.getSnapshot;

export type FieldWorkerInvoiceDraft = Omit<
  FieldWorkerInvoice,
  "id" | "createdBy" | "createdDate" | "lastModifiedBy" | "lastModifiedDate" | "revisionNumber" | "module" | "status" | "invoiceNumber"
>;

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, i) => {
    const n = parseInt(i.id.replace("FWI-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `FWI-${String(maxNum + 1).padStart(6, "0")}`;
}

export interface SaveInvoicesOptions {
  /** If provided, invoices in this batch get sequential numbers starting here instead of the auto FWI-YYYY-#### scheme. */
  startingInvoiceNumber?: string;
  /** Applied to every invoice in this batch. */
  paymentDueDate?: string;
}

export async function saveFieldWorkerInvoices(drafts: FieldWorkerInvoiceDraft[], options: SaveInvoicesOptions = {}): Promise<{ ok: boolean; error?: string }> {
  const year = new Date().getFullYear();
  // Only the *trailing* run of digits increments — e.g. "FWI-2026-0100"
  // keeps "FWI-2026-" as the prefix and counts up from 100, so the next
  // invoice becomes "FWI-2026-0101", not something mangled.
  const trailingNumberMatch = options.startingInvoiceNumber?.match(/^(.*?)(\d+)$/);
  const startPrefix = trailingNumberMatch?.[1] ?? "";
  const startNum = trailingNumberMatch ? parseInt(trailingNumberMatch[2], 10) : null;
  const startDigits = trailingNumberMatch?.[2].length ?? 0;
  for (let i = 0; i < drafts.length; i++) {
    const draft = drafts[i];
    const id = nextId();
    const invoiceNumber =
      options.startingInvoiceNumber && startNum !== null
        ? `${startPrefix}${String(startNum + i).padStart(startDigits, "0")}`
        : `FWI-${year}-${String(store.getSnapshot().length + 1).padStart(4, "0")}`;
    const result = await store.create({
      id,
      invoiceNumber,
      paymentDueDate: options.paymentDueDate || undefined,
      ...draft,
    });
    if (result === null) return { ok: false, error: store.getLastError() ?? undefined };
  }
  return { ok: true };
}

export function deleteFieldWorkerInvoice(id: string) {
  void store.remove(id);
}
