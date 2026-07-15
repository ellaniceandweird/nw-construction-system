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
