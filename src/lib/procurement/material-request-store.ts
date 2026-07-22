"use client";

import { MOCK_MATERIAL_REQUESTS } from "@/lib/data/mock/material-requests";
import type { MaterialRequest, MaterialRequestStatus } from "@/types/procurement";

const STORAGE_KEY = "project-nw:material-requests";

type Listener = () => void;

let requests: MaterialRequest[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): MaterialRequest[] {
  if (typeof window === "undefined") return MOCK_MATERIAL_REQUESTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_MATERIAL_REQUESTS;
    return JSON.parse(raw) as MaterialRequest[];
  } catch {
    return MOCK_MATERIAL_REQUESTS;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeMaterialRequests(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMaterialRequestsSnapshot(): MaterialRequest[] {
  return requests;
}

export interface MaterialRequestEditInput {
  requestStatus: MaterialRequestStatus;
  notes?: string;
  referenceUrl?: string;
}

export function updateMaterialRequest(id: string, input: MaterialRequestEditInput) {
  requests = requests.map((r) =>
    r.id === id
      ? {
          ...r,
          ...input,
          lastModifiedDate: new Date().toISOString(),
        }
      : r
  );
  persist();
  emit();
}

export interface MaterialRequestCreateInput {
  projectId: string;
  description: string;
  quantity: number;
  unit: string;
  requiredOnSiteDate: string;
  requestedBy: string;
  notes?: string;
  referenceUrl?: string;
}

function nextMrNumber(): string {
  const nums = requests
    .map((r) => parseInt(r.mrNumber.replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `MR-${(max + 1).toString().padStart(5, "0")}`;
}

export function createMaterialRequest(input: MaterialRequestCreateInput) {
  const now = new Date().toISOString();
  const mrNumber = nextMrNumber();
  const newRequest: MaterialRequest = {
    id: mrNumber,
    createdBy: "current-user",
    createdDate: now,
    lastModifiedBy: "current-user",
    lastModifiedDate: now,
    revisionNumber: 1,
    module: "Procurement",
    status: "active",
    projectId: input.projectId,
    mrNumber,
    requestedBy: input.requestedBy,
    priority: "medium",
    requestDate: now.slice(0, 10),
    requiredOnSiteDate: input.requiredOnSiteDate,
    approvalStatus: "pending",
    notes: input.notes,
    referenceUrl: input.referenceUrl,
    requestStatus: "draft",
    lineItems: [{ description: input.description, quantity: input.quantity, unit: input.unit }],
  };
  requests = [...requests, newRequest];
  persist();
  emit();
  return newRequest.id;
}
