"use client";
import { MOCK_CONTACTS } from "@/lib/data/mock/contacts";
import type { Contact, ContactCategory } from "@/types/contacts";

const STORAGE_KEY = "project-nw:contacts";
type Listener = () => void;
let contacts: Contact[] = loadInitial();
const listeners = new Set<Listener>();

function loadInitial(): Contact[] {
  if (typeof window === "undefined") return MOCK_CONTACTS;
  try { const raw = window.localStorage.getItem(STORAGE_KEY); if (!raw) return MOCK_CONTACTS; return JSON.parse(raw) as Contact[]; } catch { return MOCK_CONTACTS; }
}
function persist() { if (typeof window === "undefined") return; window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts)); }
function emit() { listeners.forEach((l) => l()); }
function nextId(): string {
  const maxNum = contacts.reduce((max, c) => { const n = parseInt(c.id.replace("CONTACT-", ""), 10); return Number.isFinite(n) ? Math.max(max, n) : max; }, 0);
  return `CONTACT-${String(maxNum + 1).padStart(6, "0")}`;
}

export function subscribeContacts(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function getContactsSnapshot(): Contact[] { return contacts; }

export interface ContactInput {
  name: string;
  company?: string;
  category: ContactCategory;
  role?: string;
  email?: string;
  phone?: string;
  address?: string;
  relatedPropertyId?: string;
  notes?: string;
}

export function createContact(input: ContactInput) {
  const now = new Date().toISOString();
  const newContact: Contact = {
    id: nextId(),
    createdBy: "user", createdDate: now,
    lastModifiedBy: "user", lastModifiedDate: now,
    revisionNumber: 1, module: "Contacts", status: "active",
    ...input,
  };
  contacts = [...contacts, newContact];
  persist(); emit();
  return newContact;
}
export function updateContact(id: string, input: ContactInput) {
  contacts = contacts.map((c) => c.id === id ? { ...c, ...input, lastModifiedDate: new Date().toISOString() } : c);
  persist(); emit();
}
export function deleteContact(id: string) {
  contacts = contacts.filter((c) => c.id !== id);
  persist(); emit();
}
export function restoreContact(contact: Contact) {
  contacts = [...contacts, contact];
  persist(); emit();
}
