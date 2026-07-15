"use client";
import { useSyncExternalStore } from "react";
import { subscribeDocuments, getDocumentsSnapshot } from "@/lib/documents/document-store";
import { MOCK_DOCUMENTS } from "@/lib/data/mock/documents";
export function useDocuments() {
  return useSyncExternalStore(subscribeDocuments, getDocumentsSnapshot, () => MOCK_DOCUMENTS);
}
