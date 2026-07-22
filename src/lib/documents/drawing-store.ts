"use client";
import { MOCK_DRAWINGS } from "@/lib/data/mock/drawings";
import type { Drawing, DrawingDiscipline, DocumentStatus } from "@/types/documents";

const STORAGE_KEY = "project-nw:drawings";
type Listener = () => void;
let drawings: Drawing[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): Drawing[] {
  if (typeof window === "undefined") return MOCK_DRAWINGS;
  try { const raw = window.localStorage.getItem(STORAGE_KEY); if (!raw) return MOCK_DRAWINGS; return JSON.parse(raw) as Drawing[]; } catch { return MOCK_DRAWINGS; }
}
function persist() { if (typeof window === "undefined") return; window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drawings)); }
function emit() { listeners.forEach((l) => l()); }
function nextId(): string {
  const maxNum = drawings.reduce((max, d) => { const n = parseInt(d.id.replace("DWG-", ""), 10); return Number.isFinite(n) ? Math.max(max, n) : max; }, 0);
  return `DWG-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeDrawings(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function getDrawingsSnapshot(): Drawing[] { return drawings; }

export interface DrawingInput {
  projectId: string;
  projectName?: string;
  propertyId?: string;
  propertyName?: string;
  drawingNumber: string;
  drawingTitle: string;
  discipline: DrawingDiscipline;
  sheetNumber?: string;
  revision: string;
  scale?: string;
  issueDate: string;
  currentRevisionUrl: string;
  drawingStatus: DocumentStatus;
  architect?: string;
  engineer?: string;
  uploadedBy: string;
}

export function createDrawing(input: DrawingInput) {
  const now = new Date().toISOString();
  const newDrawing: Drawing = {
    id: nextId(),
    createdBy: "user", createdDate: now,
    lastModifiedBy: "user", lastModifiedDate: now,
    revisionNumber: 1, module: "Documents", status: "active",
    ...input,
  };
  drawings = [...drawings, newDrawing];
  persist(); emit();
  return newDrawing;
}
export function updateDrawing(id: string, input: DrawingInput) {
  drawings = drawings.map((d) => {
    if (d.id !== id) return d;
    const previousRevisionUrls = d.revision !== input.revision ? [...(d.previousRevisionUrls ?? []), d.currentRevisionUrl] : d.previousRevisionUrls;
    return { ...d, ...input, previousRevisionUrls, lastModifiedDate: new Date().toISOString() };
  });
  persist(); emit();
}
export function deleteDrawing(id: string) {
  drawings = drawings.filter((d) => d.id !== id);
  persist(); emit();
}
