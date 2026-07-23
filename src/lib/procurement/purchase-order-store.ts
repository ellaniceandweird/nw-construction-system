"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_PURCHASE_ORDERS } from "@/lib/data/mock/purchase-orders";
import type { PurchaseOrder, PurchaseOrderLineItem, PurchaseOrderStatus } from "@/types/procurement";

function fromRow(row: Record<string, any>): PurchaseOrder {
  return {
    id: row.id,
    projectId: row.project_id,
    poNumber: row.po_number,
    vendorId: row.vendor_id,
    billingEntityId: row.billing_entity_id,
    shippingAddress: row.shipping_address ?? undefined,
    orderDate: row.order_date,
    expectedDelivery: row.expected_delivery ?? undefined,
    poStatus: row.po_status,
    terms: row.terms ?? undefined,
    currency: row.currency ?? "USD",
    tax: row.tax != null ? Number(row.tax) : undefined,
    freight: row.freight != null ? Number(row.freight) : undefined,
    total: Number(row.total ?? 0),
    notes: row.notes ?? undefined,
    lineItems: row.line_items ?? [],
    sourceRfqId: row.source_rfq_id ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Procurement",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.projectId !== undefined) row.project_id = input.projectId;
  if (input.poNumber !== undefined) row.po_number = input.poNumber;
  if (input.vendorId !== undefined) row.vendor_id = input.vendorId;
  if (input.billingEntityId !== undefined) row.billing_entity_id = input.billingEntityId;
  if (input.orderDate !== undefined) row.order_date = input.orderDate;
  if (input.expectedDelivery !== undefined) row.expected_delivery = input.expectedDelivery;
  if (input.poStatus !== undefined) row.po_status = input.poStatus;
  if (input.terms !== undefined) row.terms = input.terms;
  if (input.currency !== undefined) row.currency = input.currency;
  if (input.tax !== undefined) row.tax = input.tax;
  if (input.freight !== undefined) row.freight = input.freight;
  if (input.total !== undefined) row.total = input.total;
  if (input.notes !== undefined) row.notes = input.notes;
  if (input.lineItems !== undefined) row.line_items = input.lineItems;
  if (input.sourceRfqId !== undefined) row.source_rfq_id = input.sourceRfqId;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<PurchaseOrder>({
  table: "purchase_orders",
  seedData: MOCK_PURCHASE_ORDERS,
  fromRow,
  toRow,
  orderBy: "order_date",
});

export const subscribePurchaseOrders = store.subscribe;
export const getPurchaseOrdersSnapshot = store.getSnapshot;

export interface PurchaseOrderEditInput {
  projectId: string;
  vendorId: string;
  billingEntityId: string;
  orderDate: string;
  expectedDelivery?: string;
  terms?: string;
  poStatus: PurchaseOrderStatus;
  tax?: number;
  freight?: number;
  notes?: string;
  lineItems: PurchaseOrderLineItem[];
}

export function computeTotal(input: Pick<PurchaseOrderEditInput, "lineItems" | "tax" | "freight">): number {
  const lineTotal = input.lineItems.reduce((sum, li) => sum + li.extendedPrice, 0);
  return lineTotal + (input.tax ?? 0) + (input.freight ?? 0);
}

export function updatePurchaseOrder(id: string, input: PurchaseOrderEditInput) {
  void store.update(id, { ...input, total: computeTotal(input) });
}

function nextPoNumber(): string {
  const items = store.getSnapshot();
  const nums = items
    .map((o) => parseInt(o.poNumber.replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `PO-${(max + 1).toString().padStart(5, "0")}`;
}

/** Manual entry — always available even though most POs auto-generate from awarded quotes. */
export function createPurchaseOrder(input: PurchaseOrderEditInput) {
  const poNumber = nextPoNumber();
  const total = computeTotal(input);
  void store.create({ id: poNumber, poNumber, currency: "USD", total, ...input });
  return poNumber;
}

export interface AutoGenerateFromQuoteInput {
  rfqId: string;
  projectId: string;
  vendorId: string;
  billingEntityId: string;
  materialList: string;
  quotedPrice: number;
  freight?: number;
  tax?: number;
  leadTimeDays: number;
}

/**
 * Auto-generates a Purchase Order the moment a quote is marked Awarded —
 * per Ben and Sjaak's request, so nobody has to manually re-key an
 * already-approved quote into a PO. Skips creating a duplicate if one
 * already exists for this RFQ (e.g. re-awarding after a change).
 */
export function createPurchaseOrderFromQuote(input: AutoGenerateFromQuoteInput) {
  const existing = store.getSnapshot().find((o) => o.sourceRfqId === input.rfqId);
  if (existing) return existing.id;

  const poNumber = nextPoNumber();
  const lineItems: PurchaseOrderLineItem[] = [
    {
      description: input.materialList,
      quantity: 1,
      unit: "lot",
      unitPrice: input.quotedPrice,
      extendedPrice: input.quotedPrice,
    },
  ];
  const total = input.quotedPrice + (input.freight ?? 0) + (input.tax ?? 0);
  const expectedDelivery = new Date(Date.now() + input.leadTimeDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  void store.create({
    id: poNumber,
    projectId: input.projectId,
    poNumber,
    vendorId: input.vendorId,
    billingEntityId: input.billingEntityId,
    orderDate: new Date().toISOString().slice(0, 10),
    expectedDelivery,
    poStatus: "approved",
    currency: "USD",
    tax: input.tax,
    freight: input.freight,
    total,
    lineItems,
    sourceRfqId: input.rfqId,
  });
  return poNumber;
}
