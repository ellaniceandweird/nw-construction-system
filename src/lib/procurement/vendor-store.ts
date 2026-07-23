"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
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
  notes?: string;
}

export function updateVendor(id: string, input: VendorEditInput) {
  void store.update(id, input);
}

/** Toggles the "Recommended" checkbox column on the Vendors / Subcontractor tabs. */
export function toggleVendorRecommended(id: string, recommended: boolean) {
  void store.update(id, { isPreferredVendor: recommended });
}
