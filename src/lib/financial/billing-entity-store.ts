"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_BILLING_ENTITIES } from "@/lib/data/mock/billing-entities";
import type { BillingEntity } from "@/types/financial";

function fromRow(row: Record<string, any>): BillingEntity {
  return {
    id: row.id,
    companyName: row.company_name,
    legalName: row.legal_name ?? undefined,
    taxId: row.tax_id ?? undefined,
    address: row.address ?? undefined,
    invoicePrefix: row.invoice_prefix ?? undefined,
    defaultPaymentTerms: row.default_payment_terms ?? undefined,
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
  if (input.companyName !== undefined) row.company_name = input.companyName;
  if (input.legalName !== undefined) row.legal_name = input.legalName;
  if (input.taxId !== undefined) row.tax_id = input.taxId;
  if (input.address !== undefined) row.address = input.address;
  if (input.invoicePrefix !== undefined) row.invoice_prefix = input.invoicePrefix;
  if (input.defaultPaymentTerms !== undefined) row.default_payment_terms = input.defaultPaymentTerms;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<BillingEntity>({
  table: "billing_entities",
  seedData: MOCK_BILLING_ENTITIES,
  fromRow,
  toRow,
  orderBy: "company_name",
});

export const subscribeBillingEntities = store.subscribe;
export const getBillingEntitiesSnapshot = store.getSnapshot;

export interface BillingEntityInput {
  companyName: string;
  legalName?: string;
  taxId?: string;
  address?: string;
  invoicePrefix?: string;
  defaultPaymentTerms?: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, e) => {
    const n = parseInt(e.id.replace("BE-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `BE-${String(maxNum + 1).padStart(6, "0")}`;
}

export function createBillingEntity(input: BillingEntityInput) {
  const id = nextId();
  void store.create({ id, ...input });
  return id;
}
export function updateBillingEntity(id: string, input: BillingEntityInput) {
  void store.update(id, input);
}
export function deleteBillingEntity(id: string) {
  void store.remove(id);
}
