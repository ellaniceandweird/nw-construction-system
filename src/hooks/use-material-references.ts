"use client";
import { useSyncExternalStore } from "react";
import { subscribeMaterialReferences, getMaterialReferencesSnapshot } from "@/lib/documents/material-reference-store";

export function useMaterialReferences() {
  return useSyncExternalStore(subscribeMaterialReferences, getMaterialReferencesSnapshot, () => []);
}
