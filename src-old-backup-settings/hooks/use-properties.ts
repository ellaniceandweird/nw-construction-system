"use client";
import { useSyncExternalStore } from "react";
import { subscribeProperties, getPropertiesSnapshot } from "@/lib/properties/property-store";
import { MOCK_PROPERTIES } from "@/lib/data/mock/properties";
export function useProperties() {
  return useSyncExternalStore(subscribeProperties, getPropertiesSnapshot, () => MOCK_PROPERTIES);
}
