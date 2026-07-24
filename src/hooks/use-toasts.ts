"use client";
import { useSyncExternalStore } from "react";
import { subscribeToasts, getToastsSnapshot } from "@/lib/toast/toast-store";
import type { Toast } from "@/lib/toast/toast-store";

const EMPTY: Toast[] = [];

export function useToasts() {
  return useSyncExternalStore(subscribeToasts, getToastsSnapshot, () => EMPTY);
}
