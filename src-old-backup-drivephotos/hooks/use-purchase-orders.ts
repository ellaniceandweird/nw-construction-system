"use client";

import { useSyncExternalStore } from "react";

import { subscribePurchaseOrders, getPurchaseOrdersSnapshot } from "@/lib/procurement/purchase-order-store";
import { MOCK_PURCHASE_ORDERS } from "@/lib/data/mock/purchase-orders";

export function usePurchaseOrders() {
  return useSyncExternalStore(subscribePurchaseOrders, getPurchaseOrdersSnapshot, () => MOCK_PURCHASE_ORDERS);
}
