"use client";
import { useSyncExternalStore } from "react";
import { subscribeBillingEntities, getBillingEntitiesSnapshot } from "@/lib/financial/billing-entity-store";
import { MOCK_BILLING_ENTITIES } from "@/lib/data/mock/billing-entities";
export function useBillingEntities() {
  return useSyncExternalStore(subscribeBillingEntities, getBillingEntitiesSnapshot, () => MOCK_BILLING_ENTITIES);
}
