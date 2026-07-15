"use client";

import { useSyncExternalStore } from "react";

import { subscribeEstimates, getEstimatesSnapshot } from "@/lib/estimating/estimate-store";
import { MOCK_ESTIMATES } from "@/lib/data/mock/estimates";

export function useEstimates() {
  return useSyncExternalStore(subscribeEstimates, getEstimatesSnapshot, () => MOCK_ESTIMATES);
}
