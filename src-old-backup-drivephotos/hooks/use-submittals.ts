"use client";
import { useSyncExternalStore } from "react";
import { subscribeSubmittals, getSubmittalsSnapshot } from "@/lib/documents/submittal-store";
import { MOCK_SUBMITTALS } from "@/lib/data/mock/submittals";
export function useSubmittals() {
  return useSyncExternalStore(subscribeSubmittals, getSubmittalsSnapshot, () => MOCK_SUBMITTALS);
}
