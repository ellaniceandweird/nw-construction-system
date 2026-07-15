"use client";
import { MOCK_INVOICES } from "@/lib/data/mock/invoices";
import type { Invoice, InvoiceStatus, InvoiceLineItem } from "@/types/financial";

const STORAGE_KEY = "project-nw:invoices";
type Listener = () => void;
let invoices: Invoice[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): Invoice[] {
  if (typeof window === "undefined") return MOCK_INVOICES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return MOCK_INVOICES;
    return JSON.parse(raw) as Invoice[];
  } catch {
    return MOCK_INVOICES;
  }
}
function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}
function emit() {
  listeners.forEach((l) => l());
}
function nextId(): string {
  const maxNum = invoices.reduce((max, i) => {
    const n = parseInt(i.id.replace("INV-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `INV-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeInvoices(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getInvoicesSnapshot(): Invoice[] {
  return invoices;
}

export interface InvoiceInput {
  projectId: string;
  invoiceNumber: string;
  billingEntityId: string;
  client: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms?: string;
  preparedBy: string;
  invoiceStatus: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  totalAmount: number;
}

export function createInvoice(input: InvoiceInput) {
  const now = new Date().toISOString();
  const newInvoice: Invoice = {
    id: nextId(),
    createdBy: "user", createdDate: now,
    lastModifiedBy: "user", lastModifiedDate: now,
    revisionNumber: 1, module: "Financial", status: "active",
    ...input,
  };
  invoices = [...invoices, newInvoice];
  persist();
  emit();
  return newInvoice;
}
export function updateInvoice(id: string, input: InvoiceInput) {
  invoices = invoices.map((i) => (i.id === id ? { ...i, ...input, lastModifiedDate: new Date().toISOString() } : i));
  persist();
  emit();
}
export function deleteInvoice(id: string) {
  invoices = invoices.filter((i) => i.id !== id);
  persist();
  emit();
}
