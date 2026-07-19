import type { ProjectDocument } from "@/types/documents";

/**
 * ILLUSTRATIVE document registry entries — this tracks WHERE files live
 * (a link field, e.g. to Google Drive/Dropbox/a shared folder), not the
 * files themselves. Nice & Weird doesn't have a file-hosting backend, so
 * treating this as an index/log rather than a mini file-storage system
 * is the more honest and durable design.
 */
export const MOCK_DOCUMENTS: ProjectDocument[] = [
  {
    id: "DOC-000001",
    createdBy: "system", createdDate: "2026-06-15T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-06-15T00:00:00.000Z",
    revisionNumber: 1, module: "Documents", status: "active",
    projectId: "PRJ-000006",
    documentNumber: "DOC-2026-0001",
    title: "25 Cross St — HPC Approval Letter",
    category: "contract",
    revision: "0",
    documentStatus: "approved",
    author: "Hudson HPC",
    issueDate: "2026-06-15",
    fileType: "pdf",
    fileUrl: "https://drive.google.com/drive/folders/example-hpc-approval",
    tags: ["permits", "historic-preservation"],
  },
  {
    id: "DOC-000002",
    createdBy: "system", createdDate: "2026-06-18T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-02T00:00:00.000Z",
    revisionNumber: 2, module: "Documents", status: "active",
    projectId: "PRJ-000006",
    documentNumber: "DOC-2026-0002",
    title: "25 Cross St — Exterior Renovation Estimate",
    category: "quotation",
    revision: "2",
    documentStatus: "approved",
    author: "Ella Esquivel",
    issueDate: "2026-06-18",
    fileType: "xlsx",
    fileUrl: "https://drive.google.com/drive/folders/example-cross-st-estimate",
    tags: ["estimate", "budget"],
  },
  {
    id: "DOC-000003",
    createdBy: "system", createdDate: "2026-07-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-01T00:00:00.000Z",
    revisionNumber: 1, module: "Documents", status: "active",
    projectId: "PRJ-000010",
    documentNumber: "DOC-2026-0003",
    title: "The Wick Bulkhead — Structural Engineer Letter",
    category: "structural_drawing",
    revision: "0",
    documentStatus: "owner_review",
    author: "Structural Engineer (TBD)",
    issueDate: "2026-07-01",
    fileType: "pdf",
    fileUrl: "https://drive.google.com/drive/folders/example-bulkhead-structural",
    tags: ["structural", "bulkhead"],
  },
];
