"use client";

import { useSyncExternalStore } from "react";

import { subscribeMaterialRequests, getMaterialRequestsSnapshot } from "@/lib/procurement/material-request-store";
import { MOCK_MATERIAL_REQUESTS } from "@/lib/data/mock/material-requests";

export function useMaterialRequests() {
  return useSyncExternalStore(
    subscribeMaterialRequests,
    getMaterialRequestsSnapshot,
    () => MOCK_MATERIAL_REQUESTS
  );
}
