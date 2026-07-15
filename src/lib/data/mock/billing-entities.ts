import type { BillingEntity } from "@/types/financial";

/**
 * ILLUSTRATIVE billing entities — since Nice & Weird operates as an
 * internal team managing its own properties (no external clients), these
 * represent YOUR OWN company/property-holding entities used to pay
 * vendor invoices, not customers being billed.
 */
export const MOCK_BILLING_ENTITIES: BillingEntity[] = [
  {
    id: "BE-000001",
    createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Financial", status: "active",
    companyName: "Nice & Weird Construction LLC",
    legalName: "Nice & Weird Construction, LLC",
    address: "Hudson, NY",
    invoicePrefix: "NW",
    defaultPaymentTerms: "Net 30",
  },
  {
    id: "BE-000002",
    createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Financial", status: "active",
    companyName: "Wick Hotel Holdings LLC",
    legalName: "Wick Hotel Holdings, LLC",
    address: "Hudson, NY",
    invoicePrefix: "WH",
    defaultPaymentTerms: "Net 30",
  },
];
