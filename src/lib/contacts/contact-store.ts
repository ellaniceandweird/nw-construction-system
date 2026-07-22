"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_CONTACTS } from "@/lib/data/mock/contacts";
import type { Contact, ContactCategory } from "@/types/contacts";

function fromRow(row: Record<string, any>): Contact {
  return {
    id: row.id,
    name: row.name,
    company: row.company ?? undefined,
    category: row.category,
    role: row.role ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    relatedPropertyId: row.related_property_id ?? undefined,
    notes: row.notes ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Contacts",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.name !== undefined) row.name = input.name;
  if (input.company !== undefined) row.company = input.company;
  if (input.category !== undefined) row.category = input.category;
  if (input.role !== undefined) row.role = input.role;
  if (input.email !== undefined) row.email = input.email;
  if (input.phone !== undefined) row.phone = input.phone;
  if (input.address !== undefined) row.address = input.address;
  if (input.relatedPropertyId !== undefined) row.related_property_id = input.relatedPropertyId;
  if (input.notes !== undefined) row.notes = input.notes;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<Contact>({
  table: "contacts",
  seedData: MOCK_CONTACTS,
  fromRow,
  toRow,
  orderBy: "name",
});

export const subscribeContacts = store.subscribe;
export const getContactsSnapshot = store.getSnapshot;

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

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, c) => {
    const n = parseInt(c.id.replace("CONTACT-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `CONTACT-${String(maxNum + 1).padStart(6, "0")}`;
}

export function createContact(input: ContactInput) {
  const id = nextId();
  void store.create({ id, ...input });
  return id;
}
export function updateContact(id: string, input: ContactInput) {
  void store.update(id, input);
}
export function deleteContact(id: string) {
  void store.remove(id);
}
export function restoreContact(contact: Contact) {
  void store.create(contact);
}
