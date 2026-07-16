"use client";
import { MOCK_BILLING_ENTITIES } from "@/lib/data/mock/billing-entities";
import type { BillingEntity } from "@/types/financial";

const STORAGE_KEY = "project-nw:billing-entities";
type Listener = () => void;
let entities: BillingEntity[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): BillingEntity[] {
  if (typeof window === "undefined") return MOCK_BILLING_ENTITIES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_BILLING_ENTITIES;
    return JSON.parse(raw) as BillingEntity[];
  } catch {
    return MOCK_BILLING_ENTITIES;
  }
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entities));
}
function emit() {
  listeners.forEach((l) => l());
}
function nextId(): string {
  const maxNum = entities.reduce((max, e) => {
    const n = parseInt(e.id.replace("BE-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `BE-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeBillingEntities(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getBillingEntitiesSnapshot(): BillingEntity[] {
  return entities;
}

export interface BillingEntityInput {
  companyName: string;
  legalName?: string;
  taxId?: string;
  address?: string;
  invoicePrefix?: string;
  defaultPaymentTerms?: string;
}

export function createBillingEntity(input: BillingEntityInput) {
  const now = new Date().toISOString();
  const newEntity: BillingEntity = {
    id: nextId(),
    createdBy: "user", createdDate: now,
    lastModifiedBy: "user", lastModifiedDate: now,
    revisionNumber: 1, module: "Financial", status: "active",
    ...input,
  };
  entities = [...entities, newEntity];
  persist();
  emit();
  return newEntity;
}
export function updateBillingEntity(id: string, input: BillingEntityInput) {
  entities = entities.map((e) => (e.id === id ? { ...e, ...input, lastModifiedDate: new Date().toISOString() } : e));
  persist();
  emit();
}
export function deleteBillingEntity(id: string) {
  entities = entities.filter((e) => e.id !== id);
  persist();
  emit();
}
