"use client";
import { MOCK_PROPERTIES } from "@/lib/data/mock/properties";
import type { Property } from "@/types/maintenance";

const STORAGE_KEY = "project-nw:properties";
type Listener = () => void;
let properties: Property[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): Property[] {
  if (typeof window === "undefined") return MOCK_PROPERTIES;
  try { const raw = window.localStorage.getItem(STORAGE_KEY); if (!raw) return MOCK_PROPERTIES; return JSON.parse(raw) as Property[]; } catch { return MOCK_PROPERTIES; }
}
function persist() { if (typeof window === "undefined") return; window.localStorage.setItem(STORAGE_KEY, JSON.stringify(properties)); }
function emit() { listeners.forEach((l) => l()); }

export function subscribeProperties(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function getPropertiesSnapshot(): Property[] { return properties; }

export interface PropertyInput {
  address?: string;
  town?: string;
  coverPhotoUrl?: string;
  billingEntityId?: string;
  googleDriveFolderUrl?: string;
  googleDriveFolderName?: string;
}

export function updateProperty(id: string, input: PropertyInput) {
  properties = properties.map((p) => p.id === id ? { ...p, ...input, lastModifiedDate: new Date().toISOString() } : p);
  persist(); emit();
}
