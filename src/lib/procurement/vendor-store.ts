"use client";

import { MOCK_VENDORS } from "@/lib/data/mock/vendors";
import type { Vendor } from "@/types/procurement";

const STORAGE_KEY = "project-nw:vendors";

type Listener = () => void;

let vendors: Vendor[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): Vendor[] {
  if (typeof window === "undefined") return MOCK_VENDORS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_VENDORS;
    return JSON.parse(raw) as Vendor[];
  } catch {
    return MOCK_VENDORS;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeVendors(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getVendorsSnapshot(): Vendor[] {
  return vendors;
}

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
  vendors = vendors.map((v) =>
    v.id === id
      ? {
          ...v,
          ...input,
          lastModifiedDate: new Date().toISOString(),
        }
      : v
  );
  persist();
  emit();
}
