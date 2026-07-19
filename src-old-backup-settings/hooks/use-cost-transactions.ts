"use client";
import { useMemo } from "react";
import { useSyncExternalStore } from "react";
import { subscribeCostTransactions, getCostTransactionsSnapshot } from "@/lib/financial/cost-transaction-store";
import { derivePurchaseOrderTransactions } from "@/lib/financial/cost-transaction-derivation";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { MOCK_COST_TRANSACTIONS } from "@/lib/data/mock/cost-transactions";
import type { CostTransaction } from "@/types/financial";

/** Combines manually-entered transactions with ones derived live from real Purchase Orders. */
export function useCostTransactions(): CostTransaction[] {
  const manual = useSyncExternalStore(subscribeCostTransactions, getCostTransactionsSnapshot, () => MOCK_COST_TRANSACTIONS);
  const purchaseOrders = usePurchaseOrders();

  return useMemo(() => {
    const derived = derivePurchaseOrderTransactions(purchaseOrders);
    return [...derived, ...manual].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [manual, purchaseOrders]);
}
