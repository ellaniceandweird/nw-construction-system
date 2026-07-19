"use client";
import { useSyncExternalStore } from "react";
import { subscribeInvoices, getInvoicesSnapshot } from "@/lib/financial/invoice-store";
import { MOCK_INVOICES } from "@/lib/data/mock/invoices";
export function useInvoices() {
  return useSyncExternalStore(subscribeInvoices, getInvoicesSnapshot, () => MOCK_INVOICES);
}
