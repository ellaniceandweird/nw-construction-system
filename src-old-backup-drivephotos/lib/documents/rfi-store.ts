"use client";
import { MOCK_RFIS } from "@/lib/data/mock/rfis";
import type { RFI, RfiStatus } from "@/types/documents";

const STORAGE_KEY = "project-nw:rfis";
type Listener = () => void;
let rfis: RFI[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): RFI[] {
  if (typeof window === "undefined") return MOCK_RFIS;
  try { const raw = window.localStorage.getItem(STORAGE_KEY); if (!raw) return MOCK_RFIS; return JSON.parse(raw) as RFI[]; } catch { return MOCK_RFIS; }
}
function persist() { if (typeof window === "undefined") return; window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rfis)); }
function emit() { listeners.forEach((l) => l()); }
function nextNumber(): string { const year = new Date().getFullYear(); return `RFI-${year}-${String(rfis.length + 1).padStart(4, "0")}`; }
function nextId(): string {
  const maxNum = rfis.reduce((max, r) => { const n = parseInt(r.id.replace("RFI-", ""), 10); return Number.isFinite(n) ? Math.max(max, n) : max; }, 0);
  return `RFI-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeRfis(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function getRfisSnapshot(): RFI[] { return rfis; }

export interface RfiInput {
  projectId: string;
  subject: string;
  category?: string;
  description: string;
  question: string;
  requestedBy: string;
  assignedTo?: string;
  priority: RFI["priority"];
  dateSubmitted: string;
  requiredResponseDate: string;
  actualResponseDate?: string;
  rfiStatus: RfiStatus;
  answer?: string;
}

export function createRfi(input: RfiInput) {
  const now = new Date().toISOString();
  const newRfi: RFI = {
    id: nextId(),
    createdBy: "user", createdDate: now,
    lastModifiedBy: "user", lastModifiedDate: now,
    revisionNumber: 1, module: "Documents", status: "active",
    rfiNumber: nextNumber(),
    ...input,
  };
  rfis = [...rfis, newRfi];
  persist(); emit();
  return newRfi;
}
export function updateRfi(id: string, input: RfiInput) {
  rfis = rfis.map((r) => r.id === id ? { ...r, ...input, lastModifiedDate: new Date().toISOString() } : r);
  persist(); emit();
}
export function deleteRfi(id: string) {
  rfis = rfis.filter((r) => r.id !== id);
  persist(); emit();
}
