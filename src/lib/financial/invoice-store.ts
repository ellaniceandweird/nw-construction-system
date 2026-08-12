"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_INVOICES } from "@/lib/data/mock/invoices";
import type { Invoice, InvoiceStatus, InvoiceLineItem } from "@/types/financial";

function fromRow(row: Record<string, any>): Invoice {
  return {
    id: row.id,
    projectId: row.project_id,
    invoiceNumber: row.invoice_number,
    billingEntityId: row.billing_entity_id,
    client: row.client,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    paymentTerms: row.payment_terms ?? undefined,
    preparedBy: row.prepared_by,
    invoiceStatus: row.invoice_status,
    lineItems: row.line_items ?? [],
    totalAmount: Number(row.total_amount ?? 0),
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Financial",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.projectId !== undefined) row.project_id = input.projectId;
  if (input.invoiceNumber !== undefined) row.invoice_number = input.invoiceNumber;
  if (input.billingEntityId !== undefined) row.billing_entity_id = input.billingEntityId;
  if (input.client !== undefined) row.client = input.client;
  if (input.invoiceDate !== undefined) row.invoice_date = input.invoiceDate || null;
  if (input.dueDate !== undefined) row.due_date = input.dueDate || null;
  if (input.paymentTerms !== undefined) row.payment_terms = input.paymentTerms;
  if (input.preparedBy !== undefined) row.prepared_by = input.preparedBy;
  if (input.invoiceStatus !== undefined) row.invoice_status = input.invoiceStatus;
  if (input.lineItems !== undefined) row.line_items = input.lineItems;
  if (input.totalAmount !== undefined) row.total_amount = input.totalAmount;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<Invoice>({
  table: "invoices",
  seedData: MOCK_INVOICES,
  fromRow,
  toRow,
  orderBy: "invoice_date",
});

export const subscribeInvoices = store.subscribe;
export const getInvoicesSnapshot = store.getSnapshot;

export interface InvoiceInput {
  projectId: string;
  invoiceNumber: string;
  billingEntityId: string;
  client: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms?: string;
  preparedBy: string;
  invoiceStatus: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  totalAmount: number;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, i) => {
    const n = parseInt(i.id.replace("INV-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `INV-${String(maxNum + 1).padStart(6, "0")}`;
}

export async function createInvoice(input: InvoiceInput): Promise<{ ok: boolean; error?: string; id: string }> {
  const id = nextId();
  const result = await store.create({ id, ...input });
  return result !== null
    ? { ok: true, id }
    : { ok: false, error: store.getLastError() ?? undefined, id };
}

export async function updateInvoice(id: string, input: InvoiceInput): Promise<{ ok: boolean; error?: string }> {
  const ok = await store.update(id, input);
  return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}

export function deleteInvoice(id: string) {
  void store.remove(id);
}
