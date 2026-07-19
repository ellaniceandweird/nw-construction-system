"use client";

import { useSyncExternalStore } from "react";

import { subscribeRFQs, getRFQsSnapshot } from "@/lib/procurement/rfq-store";
import { MOCK_RFQS } from "@/lib/data/mock/rfqs";

export function useRFQs() {
  return useSyncExternalStore(subscribeRFQs, getRFQsSnapshot, () => MOCK_RFQS);
}
