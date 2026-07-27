"use client";
import { useSyncExternalStore } from "react";
import { subscribeApprovalRequests, getApprovalRequestsSnapshot } from "@/lib/approvals/approval-request-store";

export function useApprovalRequests() {
  return useSyncExternalStore(subscribeApprovalRequests, getApprovalRequestsSnapshot, () => []);
}
