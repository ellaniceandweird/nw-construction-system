"use client";

import { createCollectionStore, createWithIdRetry } from "@/lib/supabase/collection-store";
import { MOCK_VENDORS } from "@/lib/data/mock/vendors";
import type { Vendor } from "@/types/procurement";

function fromRow(row: Record<string, any>): Vendor {
  return {
    id: row.id,
    vendorName: row.vendor_name,
    legalName: row.legal_name ?? undefined,
    vendorCategory: row.vendor_category,
    trade: row.trade ?? undefined,
    supplierType: row.supplier_type ?? undefined,
    primaryContact: row.primary_contact ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    zip: row.zip ?? undefined,
    country: row.country ?? undefined,
    paymentTerms: row.payment_terms ?? undefined,
    leadTimeDays: row.lead_time_days ?? undefined,
    taxId: row.tax_id ?? undefined,
    creditAccount: row.credit_account ?? undefined,
    insuranceExpiration: row.insurance_expiration ?? undefined,
    licenseExpiration: row.license_expiration ?? undefined,
    bondInformation: row.bond_information ?? undefined,
    isPreferredVendor: row.is_preferred_vendor ?? false,
    isApprovedVendor: row.is_approved_vendor ?? true,
    minorityOwnedStatus: row.minority_owned_status ?? undefined,
    notes: row.notes ?? undefined,
    performance: row.performance ?? {
      totalPurchaseOrders: 0,
      onTimeDeliveryPercent: 0,
      averageDeliveryDays: 0,
      qualityRating: 0,
      priceRating: 0,
      communicationRating: 0,
      overallVendorScore: 0,
    },
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
  if (input.vendorName !== undefined) row.vendor_name = input.vendorName;
  if (input.legalName !== undefined) row.legal_name = input.legalName;
  if (input.vendorCategory !== undefined) row.vendor_category = input.vendorCategory;
  if (input.trade !== undefined) row.trade = input.trade;
  if (input.supplierType !== undefined) row.supplier_type = input.supplierType;
  if (input.primaryContact !== undefined) row.primary_contact = input.primaryContact;
  if (input.email !== undefined) row.email = input.email;
  if (input.phone !== undefined) row.phone = input.phone;
  if (input.website !== undefined) row.website = input.website;
  if (input.address !== undefined) row.address = input.address;
  if (input.city !== undefined) row.city = input.city;
  if (input.state !== undefined) row.state = input.state;
  if (input.zip !== undefined) row.zip = input.zip;
  if (input.notes !== undefined) row.notes = input.notes;
  if (input.isPreferredVendor !== undefined) row.is_preferred_vendor = input.isPreferredVendor;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<Vendor>({
  table: "vendors",
  seedData: MOCK_VENDORS,
  fromRow,
  toRow,
  orderBy: "vendor_name",
});

export const subscribeVendors = store.subscribe;
export const getVendorsSnapshot = store.getSnapshot;

export interface VendorEditInput {
  vendorName: string;
  vendorCategory: string;
  trade?: string;
  supplierType?: Vendor["supplierType"];
  primaryContact?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
}

export async function updateVendor(id: string, input: VendorEditInput): Promise<{ ok: boolean; error?: string }> {
  const ok = await store.update(id, input);
  return ok ? { ok: true } : { ok: false, error: store.getLastError() ?? undefined };
}

function nextVendorId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, v) => {
    const n = parseInt(v.id.replace("VEN-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `VEN-${String(maxNum + 1).padStart(6, "0")}`;
}

function bumpVendorId(id: string): string {
  const n = parseInt(id.replace("VEN-", ""), 10);
  return `VEN-${String((Number.isFinite(n) ? n : 0) + 1).padStart(6, "0")}`;
}

export async function createVendor(input: VendorEditInput): Promise<{ ok: boolean; error?: string }> {
  return createWithIdRetry(
    store,
    nextVendorId(),
    (id) => ({
      id,
      isPreferredVendor: false,
      isApprovedVendor: true,
      performance: {
        totalPurchaseOrders: 0,
        onTimeDeliveryPercent: 0,
        averageDeliveryDays: 0,
        qualityRating: 0,
        priceRating: 0,
        communicationRating: 0,
        overallVendorScore: 0,
      },
      ...input,
    }),
    bumpVendorId
  );
}

/** Bulk import — e.g. rows pasted from Google Sheets. Creates one at a time so a bad row doesn't block the rest; reports which failed. */
export async function createVendorsBulk(inputs: VendorEditInput[]): Promise<{ succeeded: number; failed: { row: number; error?: string }[] }> {
  const failed: { row: number; error?: string }[] = [];
  let succeeded = 0;
  for (let i = 0; i < inputs.length; i++) {
    const result = await createVendor(inputs[i]);
    if (result.ok) succeeded++;
    else failed.push({ row: i + 1, error: result.error });
  }
  return { succeeded, failed };
}

/** Toggles the "Recommended" checkbox column on the Vendors / Subcontractor tabs. */
export function toggleVendorRecommended(id: string, recommended: boolean) {
  void store.update(id, { isPreferredVendor: recommended });
}

export function deleteVendor(id: string) {
  void store.remove(id);
}
