"use client";
import { MOCK_SUBMITTALS } from "@/lib/data/mock/submittals";
import type { Submittal, SubmittalStatus } from "@/types/documents";

const STORAGE_KEY = "project-nw:submittals";
type Listener = () => void;
let submittals: Submittal[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): Submittal[] {
  if (typeof window === "undefined") return MOCK_SUBMITTALS;
  try { const raw = window.localStorage.getItem(STORAGE_KEY); if (!raw) return MOCK_SUBMITTALS; return JSON.parse(raw) as Submittal[]; } catch { return MOCK_SUBMITTALS; }
}
function persist() { if (typeof window === "undefined") return; window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submittals)); }
function emit() { listeners.forEach((l) => l()); }
function nextNumber(): string { const year = new Date().getFullYear(); return `SUB-${year}-${String(submittals.length + 1).padStart(4, "0")}`; }
function nextId(): string {
  const maxNum = submittals.reduce((max, s) => { const n = parseInt(s.id.replace("SUB-", ""), 10); return Number.isFinite(n) ? Math.max(max, n) : max; }, 0);
  return `SUB-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeSubmittals(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function getSubmittalsSnapshot(): Submittal[] { return submittals; }

export interface SubmittalInput {
  projectId: string;
  specificationSection?: string;
  material?: string;
  manufacturer?: string;
  vendorId?: string;
  submittedBy: string;
  reviewer?: string;
  submissionDate: string;
  requiredDate?: string;
  returnedDate?: string;
  submittalStatus: SubmittalStatus;
  comments?: string;
}

export function createSubmittal(input: SubmittalInput) {
  const now = new Date().toISOString();
  const newSubmittal: Submittal = {
    id: nextId(),
    createdBy: "user", createdDate: now,
    lastModifiedBy: "user", lastModifiedDate: now,
    revisionNumber: 1, module: "Documents", status: "active",
    submittalNumber: nextNumber(),
    ...input,
  };
  submittals = [...submittals, newSubmittal];
  persist(); emit();
  return newSubmittal;
}
export function updateSubmittal(id: string, input: SubmittalInput) {
  submittals = submittals.map((s) => s.id === id ? { ...s, ...input, lastModifiedDate: new Date().toISOString() } : s);
  persist(); emit();
}
export function deleteSubmittal(id: string) {
  submittals = submittals.filter((s) => s.id !== id);
  persist(); emit();
}
