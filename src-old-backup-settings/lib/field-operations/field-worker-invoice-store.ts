"use client";
import type { FieldWorkerInvoice } from "@/types/field-worker-invoices";

const STORAGE_KEY = "project-nw:field-worker-invoices";
type Listener = () => void;
let invoices: FieldWorkerInvoice[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): FieldWorkerInvoice[] {
  if (typeof window === "undefined") return [];
  try { const raw = window.localStorage.getItem(STORAGE_KEY); if (!raw) return []; return JSON.parse(raw) as FieldWorkerInvoice[]; } catch { return []; }
}
function persist() { if (typeof window === "undefined") return; window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices)); }
function emit() { listeners.forEach((l) => l()); }
export function subscribeFieldWorkerInvoices(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function getFieldWorkerInvoicesSnapshot(): FieldWorkerInvoice[] { return invoices; }

export type FieldWorkerInvoiceDraft = Omit<FieldWorkerInvoice, "id" | "createdBy" | "createdDate" | "lastModifiedBy" | "lastModifiedDate" | "revisionNumber" | "module" | "status" | "invoiceNumber">;

export function saveFieldWorkerInvoices(drafts: FieldWorkerInvoiceDraft[]) {
  const now = new Date().toISOString();
  const year = new Date().getFullYear();
  const newInvoices: FieldWorkerInvoice[] = drafts.map((draft, i) => ({
    id: `FWI-${String(Date.now() + i).slice(-6)}`,
    createdBy: "user", createdDate: now,
    lastModifiedBy: "user", lastModifiedDate: now,
    revisionNumber: 1, module: "Field Operations", status: "active",
    invoiceNumber: `FWI-${year}-${String(invoices.length + i + 1).padStart(4, "0")}`,
    ...draft,
  }));
  invoices = [...invoices, ...newInvoices];
  persist();
  emit();
  return newInvoices;
}
export function deleteFieldWorkerInvoice(id: string) {
  invoices = invoices.filter((i) => i.id !== id);
  persist();
  emit();
}
