"use client";
import { MOCK_FIELD_PHOTOS } from "@/lib/data/mock/field-photos";
import type { FieldPhoto, PhotoCategory } from "@/types/field-operations";

const STORAGE_KEY = "project-nw:field-photos";
type Listener = () => void;
let photos: FieldPhoto[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): FieldPhoto[] {
  if (typeof window === "undefined") return MOCK_FIELD_PHOTOS;
  try { const raw = window.localStorage.getItem(STORAGE_KEY); if (!raw) return MOCK_FIELD_PHOTOS; return JSON.parse(raw) as FieldPhoto[]; } catch { return MOCK_FIELD_PHOTOS; }
}
function persist() { if (typeof window === "undefined") return; window.localStorage.setItem(STORAGE_KEY, JSON.stringify(photos)); }
function emit() { listeners.forEach((l) => l()); }
function nextId(): string {
  const maxNum = photos.reduce((max, p) => { const n = parseInt(p.id.replace("PHOTO-", ""), 10); return Number.isFinite(n) ? Math.max(max, n) : max; }, 0);
  return `PHOTO-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribePhotos(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function getPhotosSnapshot(): FieldPhoto[] { return photos; }

export interface PhotoInput {
  projectId: string;
  dateTaken: string;
  uploadedBy: string;
  caption?: string;
  category: PhotoCategory;
  fileUrl: string;
  thumbnailUrl?: string;
}

export function createPhoto(input: PhotoInput) {
  const now = new Date().toISOString();
  const newPhoto: FieldPhoto = {
    id: nextId(),
    createdBy: "user", createdDate: now,
    lastModifiedBy: "user", lastModifiedDate: now,
    revisionNumber: 1, module: "Documents", status: "active",
    fileVersion: 1,
    ...input,
  };
  photos = [...photos, newPhoto];
  persist(); emit();
  return newPhoto;
}
export function createPhotos(inputs: PhotoInput[]) {
  for (const input of inputs) createPhoto(input);
}
export function updatePhoto(id: string, input: PhotoInput) {
  photos = photos.map((p) => p.id === id ? { ...p, ...input, lastModifiedDate: new Date().toISOString() } : p);
  persist(); emit();
}
export function deletePhoto(id: string) {
  photos = photos.filter((p) => p.id !== id);
  persist(); emit();
}
export function restorePhoto(photo: FieldPhoto) {
  photos = [...photos, photo];
  persist(); emit();
}
