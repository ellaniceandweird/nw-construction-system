"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_PROPERTIES } from "@/lib/data/mock/properties";
import type { Property } from "@/types/maintenance";

function fromRow(row: Record<string, any>): Property {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? undefined,
    town: row.town ?? undefined,
    billingEntityId: row.billing_entity_id ?? undefined,
    relatedProjectId: row.related_project_id ?? undefined,
    coverPhotoUrl: row.cover_photo_url ?? undefined,
    googleDriveFolderUrl: row.google_drive_folder_url ?? undefined,
    googleDriveFolderName: row.google_drive_folder_name ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Properties",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.name !== undefined) row.name = input.name;
  if (input.address !== undefined) row.address = input.address;
  if (input.town !== undefined) row.town = input.town;
  if (input.billingEntityId !== undefined) row.billing_entity_id = input.billingEntityId;
  if (input.relatedProjectId !== undefined) row.related_project_id = input.relatedProjectId;
  if (input.coverPhotoUrl !== undefined) row.cover_photo_url = input.coverPhotoUrl;
  if (input.googleDriveFolderUrl !== undefined) row.google_drive_folder_url = input.googleDriveFolderUrl;
  if (input.googleDriveFolderName !== undefined) row.google_drive_folder_name = input.googleDriveFolderName;
  if (input.lastModifiedDate !== undefined) row.last_modified_date = input.lastModifiedDate;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<Property>({
  table: "properties",
  seedData: MOCK_PROPERTIES,
  fromRow,
  toRow,
  orderBy: "name",
});

export const subscribeProperties = store.subscribe;
export const getPropertiesSnapshot = store.getSnapshot;

export interface PropertyInput {
  address?: string;
  town?: string;
  coverPhotoUrl?: string;
  billingEntityId?: string;
  googleDriveFolderUrl?: string;
  googleDriveFolderName?: string;
}

/** Updates a property. Fire-and-forget is fine — the UI updates optimistically and reconciles with the real database in the background. */
export function updateProperty(id: string, input: PropertyInput) {
  void store.update(id, input);
}
