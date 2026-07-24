"use client";

import { createCollectionStore } from "@/lib/supabase/collection-store";
import { MOCK_FIELD_PHOTOS } from "@/lib/data/mock/field-photos";
import type { FieldPhoto, PhotoCategory } from "@/types/field-operations";

function fromRow(row: Record<string, any>): FieldPhoto {
  return {
    id: row.id,
    projectId: row.project_id,
    projectName: row.project_name ?? undefined,
    propertyId: row.property_id ?? undefined,
    propertyName: row.property_name ?? undefined,
    activityId: row.activity_id ?? undefined,
    dateTaken: row.date_taken,
    uploadedBy: row.uploaded_by ?? "",
    location: row.location ?? undefined,
    caption: row.caption ?? undefined,
    tags: row.tags ?? undefined,
    category: row.category,
    fileUrl: row.file_url,
    fileVersion: row.file_version ?? 1,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    createdBy: row.created_by ?? "system",
    createdDate: row.created_date ?? new Date().toISOString(),
    lastModifiedBy: row.last_modified_by ?? "system",
    lastModifiedDate: row.last_modified_date ?? new Date().toISOString(),
    revisionNumber: row.revision_number ?? 1,
    module: "Documents",
    status: row.status ?? "active",
  };
}

function toRow(input: Record<string, any>): Record<string, any> {
  const row: Record<string, any> = {};
  if (input.id !== undefined) row.id = input.id;
  if (input.projectId !== undefined) row.project_id = input.projectId;
  if (input.projectName !== undefined) row.project_name = input.projectName;
  if (input.propertyId !== undefined) row.property_id = input.propertyId;
  if (input.propertyName !== undefined) row.property_name = input.propertyName;
  if (input.activityId !== undefined) row.activity_id = input.activityId;
  if (input.dateTaken !== undefined) row.date_taken = input.dateTaken;
  if (input.uploadedBy !== undefined) row.uploaded_by = input.uploadedBy;
  if (input.location !== undefined) row.location = input.location;
  if (input.caption !== undefined) row.caption = input.caption;
  if (input.tags !== undefined) row.tags = input.tags;
  if (input.category !== undefined) row.category = input.category;
  if (input.fileUrl !== undefined) row.file_url = input.fileUrl;
  if (input.fileVersion !== undefined) row.file_version = input.fileVersion;
  if (input.thumbnailUrl !== undefined) row.thumbnail_url = input.thumbnailUrl;
  row.last_modified_date = new Date().toISOString();
  return row;
}

const store = createCollectionStore<FieldPhoto>({
  table: "field_photos",
  seedData: MOCK_FIELD_PHOTOS,
  fromRow,
  toRow,
  orderBy: "date_taken",
});

export const subscribePhotos = store.subscribe;
export const getPhotosSnapshot = store.getSnapshot;

export interface PhotoInput {
  projectId: string;
  projectName?: string;
  propertyId?: string;
  propertyName?: string;
  dateTaken: string;
  uploadedBy: string;
  caption?: string;
  category: PhotoCategory;
  fileUrl: string;
  thumbnailUrl?: string;
}

function nextId(): string {
  const items = store.getSnapshot();
  const maxNum = items.reduce((max, p) => {
    const n = parseInt(p.id.replace("PHOTO-", ""), 10);
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `PHOTO-${String(maxNum + 1).padStart(6, "0")}`;
}

export function createPhoto(input: PhotoInput) {
  const id = nextId();
  void store.create({ id, fileVersion: 1, ...input });
  return id;
}
export function createPhotos(inputs: PhotoInput[]) {
  for (const input of inputs) createPhoto(input);
}
export function updatePhoto(id: string, input: PhotoInput) {
  void store.update(id, input);
}
export function deletePhoto(id: string) {
  void store.remove(id);
}
export function restorePhoto(photo: FieldPhoto) {
  void store.create(photo);
}
