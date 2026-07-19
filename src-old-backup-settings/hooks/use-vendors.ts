"use client";

import { useSyncExternalStore } from "react";

import { subscribeVendors, getVendorsSnapshot } from "@/lib/procurement/vendor-store";
import { MOCK_VENDORS } from "@/lib/data/mock/vendors";

export function useVendors() {
  return useSyncExternalStore(subscribeVendors, getVendorsSnapshot, () => MOCK_VENDORS);
}
