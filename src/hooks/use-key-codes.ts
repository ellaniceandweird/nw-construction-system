"use client";
import { useSyncExternalStore } from "react";
import { subscribeKeyCodes, getKeyCodesSnapshot } from "@/lib/maintenance/key-code-store";

export function useKeyCodes() {
  return useSyncExternalStore(subscribeKeyCodes, getKeyCodesSnapshot, () => []);
}
