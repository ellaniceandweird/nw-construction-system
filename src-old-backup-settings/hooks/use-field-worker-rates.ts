"use client";
import { useSyncExternalStore } from "react";
import { subscribeFieldWorkerRates, getFieldWorkerRatesSnapshot } from "@/lib/references/field-worker-rate-store";
import { MOCK_FIELD_WORKER_RATES } from "@/lib/data/mock/field-worker-rates";
export function useFieldWorkerRates() {
  return useSyncExternalStore(subscribeFieldWorkerRates, getFieldWorkerRatesSnapshot, () => MOCK_FIELD_WORKER_RATES);
}
