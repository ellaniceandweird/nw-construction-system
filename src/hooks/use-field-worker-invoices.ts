"use client";
import { useSyncExternalStore } from "react";
import { subscribeFieldWorkerInvoices, getFieldWorkerInvoicesSnapshot } from "@/lib/field-operations/field-worker-invoice-store";
import type { FieldWorkerInvoice } from "@/types/field-worker-invoices";

const EMPTY: FieldWorkerInvoice[] = [];

export function useFieldWorkerInvoices() {
  return useSyncExternalStore(subscribeFieldWorkerInvoices, getFieldWorkerInvoicesSnapshot, () => EMPTY);
}
