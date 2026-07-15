"use client";
import { MOCK_DOCUMENTS } from "@/lib/data/mock/documents";
import type { ProjectDocument, DocumentCategory, DocumentStatus } from "@/types/documents";

const STORAGE_KEY = "project-nw:documents";
type Listener = () => void;
let documents: ProjectDocument[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): ProjectDocument[] {
  if (typeof window === "undefined") return MOCK_DOCUMENTS;
  try { const raw = window.localStorage.getItem(STORAGE_KEY); if (!raw) return MOCK_DOCUMENTS; return JSON.parse(raw) as ProjectDocument[]; } catch { return MOCK_DOCUMENTS; }
}
function persist() { if (typeof window === "undefined") return; window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents)); }
function emit() { listeners.forEach((l) => l()); }
function nextNumber(): string { const year = new Date().getFullYear(); return `DOC-${year}-${String(documents.length + 1).padStart(4, "0")}`; }
function nextId(): string {
  const maxNum = documents.reduce((max, d) => { const n = parseInt(d.id.replace("DOC-", ""), 10); return Number.isFinite(n) ? Math.max(max, n) : max; }, 0);
  return `DOC-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeDocuments(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function getDocumentsSnapshot(): ProjectDocument[] { return documents; }

export interface DocumentInput {
  projectId: string;
  title: string;
  category: DocumentCategory;
  revision: string;
  documentStatus: DocumentStatus;
  author?: string;
  issueDate?: string;
  fileType: string;
  fileUrl: string;
  tags?: string[];
  comments?: string;
}

export function createDocument(input: DocumentInput) {
  const now = new Date().toISOString();
  const newDoc: ProjectDocument = {
    id: nextId(),
    createdBy: "user", createdDate: now,
    lastModifiedBy: "user", lastModifiedDate: now,
    revisionNumber: 1, module: "Documents", status: "active",
    documentNumber: nextNumber(),
    ...input,
  };
  documents = [...documents, newDoc];
  persist(); emit();
  return newDoc;
}
export function updateDocument(id: string, input: DocumentInput) {
  documents = documents.map((d) => d.id === id ? { ...d, ...input, lastModifiedDate: new Date().toISOString() } : d);
  persist(); emit();
}
export function deleteDocument(id: string) {
  documents = documents.filter((d) => d.id !== id);
  persist(); emit();
}
