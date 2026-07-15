"use client";
import { useSyncExternalStore } from "react";
import { subscribeRfis, getRfisSnapshot } from "@/lib/documents/rfi-store";
import { MOCK_RFIS } from "@/lib/data/mock/rfis";
export function useRfis() {
  return useSyncExternalStore(subscribeRfis, getRfisSnapshot, () => MOCK_RFIS);
}
