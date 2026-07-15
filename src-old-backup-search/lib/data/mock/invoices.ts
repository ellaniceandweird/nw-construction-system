import type { Invoice } from "@/types/financial";

/**
 * ILLUSTRATIVE vendor invoices — accounts payable, not client billing
 * (Nice & Weird manages its own properties internally, no external
 * clients to invoice). Tied to real vendors and projects.
 */
export const MOCK_INVOICES: Invoice[] = [
  {
    id: "INV-000001",
    createdBy: "system", createdDate: "2026-06-26T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-01T00:00:00.000Z",
    revisionNumber: 1, module: "Financial", status: "active",
    projectId: "PRJ-000006",
    invoiceNumber: "HVL-8842",
    billingEntityId: "BE-000001",
    client: "Hudson Valley Lumber Co.",
    invoiceDate: "2026-06-26",
    dueDate: "2026-07-26",
    paymentTerms: "Net 30",
    preparedBy: "Ella Esquivel",
    invoiceStatus: "paid",
    lineItems: [
      { description: "Cedar siding boards", quantity: 1200, unit: "sf", unitPrice: 4.25, amount: 5100, total: 5100 },
    ],
    totalAmount: 5100,
  },
  {
    id: "INV-000002",
    createdBy: "system", createdDate: "2026-07-14T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-14T00:00:00.000Z",
    revisionNumber: 1, module: "Financial", status: "active",
    projectId: "PRJ-000006",
    invoiceNumber: "RVR-1187",
    billingEntityId: "BE-000001",
    client: "Ridgeline Roofing Crew",
    invoiceDate: "2026-07-14",
    dueDate: "2026-07-28",
    paymentTerms: "Net 14",
    preparedBy: "Ella Esquivel",
    invoiceStatus: "pending_approval",
    lineItems: [
      { description: "Standing seam metal roof — labor & materials", quantity: 1, unit: "LS", unitPrice: 30000, amount: 30000, total: 30000 },
    ],
    totalAmount: 30000,
  },
  {
    id: "INV-000003",
    createdBy: "system", createdDate: "2026-07-10T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-10T00:00:00.000Z",
    revisionNumber: 1, module: "Financial", status: "active",
    projectId: "PRJ-000010",
    invoiceNumber: "NFS-2290",
    billingEntityId: "BE-000002",
    client: "North Front Street Hardware",
    invoiceDate: "2026-07-10",
    dueDate: "2026-07-17",
    paymentTerms: "Net 7",
    preparedBy: "Ella Esquivel",
    invoiceStatus: "overdue",
    lineItems: [
      { description: "Rebar, #4 grade 60", quantity: 40, unit: "pieces", unitPrice: 21.5, amount: 860, total: 860 },
    ],
    totalAmount: 860,
  },
];
