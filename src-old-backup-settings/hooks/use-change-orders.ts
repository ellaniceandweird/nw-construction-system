"use client";
import { useSyncExternalStore } from "react";
import { subscribeChangeOrders, getChangeOrdersSnapshot } from "@/lib/estimating/change-order-store";
import { MOCK_CHANGE_ORDERS } from "@/lib/data/mock/change-orders";
export function useChangeOrders() {
  return useSyncExternalStore(subscribeChangeOrders, getChangeOrdersSnapshot, () => MOCK_CHANGE_ORDERS);
}
