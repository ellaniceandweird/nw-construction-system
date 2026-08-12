"use client";
import { useSyncExternalStore } from "react";
import { subscribeSubcontractorSourcing, getSubcontractorSourcingSnapshot } from "@/lib/procurement/subcontractor-sourcing-store";

export function useSubcontractorSourcing() {
  return useSyncExternalStore(subscribeSubcontractorSourcing, getSubcontractorSourcingSnapshot, () => []);
}
