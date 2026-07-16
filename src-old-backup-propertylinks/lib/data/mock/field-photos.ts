import type { FieldPhoto } from "@/types/field-operations";

/**
 * ILLUSTRATIVE field photos — no real photo library existed before this
 * build. fileUrl points to Google Drive; thumbnailUrl is best-effort only
 * (Drive thumbnail links from the picker are session-scoped and may not
 * always render later — the UI falls back to a generic icon when that happens).
 */
export const MOCK_FIELD_PHOTOS: FieldPhoto[] = [
  {
    id: "PHOTO-000001",
    createdBy: "system", createdDate: "2026-06-24T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-06-24T00:00:00.000Z",
    revisionNumber: 1, module: "Documents", status: "active",
    projectId: "PRJ-000006",
    dateTaken: "2026-06-24",
    uploadedBy: "Ella Esquivel",
    caption: "North wall siding removed, sill plate rot visible",
    category: "deficiency",
    fileUrl: "https://drive.google.com/drive/folders/example-sill-plate-rot",
    fileVersion: 1,
  },
  {
    id: "PHOTO-000002",
    createdBy: "system", createdDate: "2026-07-10T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-10T00:00:00.000Z",
    revisionNumber: 1, module: "Documents", status: "active",
    projectId: "PRJ-000006",
    dateTaken: "2026-07-10",
    uploadedBy: "Ella Esquivel",
    caption: "Cedar siding install progress, west elevation",
    category: "progress",
    fileUrl: "https://drive.google.com/drive/folders/example-siding-progress",
    fileVersion: 1,
  },
  {
    id: "PHOTO-000003",
    createdBy: "system", createdDate: "2026-07-02T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-02T00:00:00.000Z",
    revisionNumber: 1, module: "Documents", status: "active",
    projectId: "PRJ-000010",
    dateTaken: "2026-07-02",
    uploadedBy: "Ella Esquivel",
    caption: "Bulkhead before demo — existing hardware condition",
    category: "before_work",
    fileUrl: "https://drive.google.com/drive/folders/example-bulkhead-before",
    fileVersion: 1,
  },
];
