"use client";
import { useSyncExternalStore } from "react";
import { subscribeCostLedgerNotes, getCostLedgerNotesSnapshot } from "@/lib/financial/cost-ledger-notes-store";
export function useCostLedgerNotes(): Record<string, string> {
  return useSyncExternalStore(subscribeCostLedgerNotes, getCostLedgerNotesSnapshot, () => ({}) as Record<string, string>);
}
