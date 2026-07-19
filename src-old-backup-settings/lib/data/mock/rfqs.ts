import type { RequestForQuotation } from "@/types";
import { scoreResponses } from "@/lib/procurement/quote-scoring";

/**
 * ILLUSTRATIVE RFQ + quote data. The source workbook has no real RFQ or
 * vendor-quote records — this uses realistic scenarios tied to REAL projects
 * and the illustrative Hudson Valley vendor list so the RFQ / Quotes /
 * Quote Comparison tabs have something meaningful to show. Replace with
 * real procurement data once Excel/Procurement integration exists (Phase 8).
 */
function rfq(
  data: Omit<RequestForQuotation, "responses"> & {
    responses: Omit<RequestForQuotation["responses"][number], "overallScore">[];
  }
): RequestForQuotation {
  return { ...data, responses: scoreResponses(data.responses) };
}

export const MOCK_RFQS: RequestForQuotation[] = [
  rfq({
    id: "RFQ-000001",
    createdBy: "system", createdDate: "2026-06-22T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-02T00:00:00.000Z",
    revisionNumber: 1, module: "Procurement", status: "active",
    projectId: "PRJ-000006",
    rfqNumber: "RFQ-2026-0001",
    materialRequestId: "MR-000001",
    vendorIds: ["VEN-000001", "VEN-000006"],
    issueDate: "2026-06-22",
    dueDate: "2026-06-29",
    scope: "Additional cedar siding for north side, per MR-2026-0001.",
    materialList: "Cedar siding, 300 sf, matching existing profile.",
    notes: "Both vendors carry the same profile; comparing on price and lead time.",
    awardedVendorId: "VEN-000001",
    responses: [
      {
        vendorId: "VEN-000001",
        quotedPrice: 1350,
        leadTimeDays: 5,
        freight: 0,
        tax: 108,
        warranty: "1 year against defects",
        notes: "In stock, can ship same week.",
        validityPeriodDays: 30,
        submittedDate: "2026-06-24",
      },
      {
        vendorId: "VEN-000006",
        quotedPrice: 1290,
        leadTimeDays: 12,
        freight: 45,
        tax: 103,
        warranty: "None stated",
        notes: "Needs to special-order the profile match.",
        validityPeriodDays: 14,
        submittedDate: "2026-06-26",
      },
    ],
  }),
  rfq({
    id: "RFQ-000002",
    createdBy: "system", createdDate: "2026-07-11T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-13T00:00:00.000Z",
    revisionNumber: 1, module: "Procurement", status: "active",
    projectId: "PRJ-000010",
    rfqNumber: "RFQ-2026-0002",
    materialRequestId: "MR-000003",
    vendorIds: ["VEN-000007", "VEN-000009", "VEN-000006"],
    issueDate: "2026-07-11",
    dueDate: "2026-07-18",
    scope: "Rebar for bulkhead reinforcement, per MR-2026-0003 and engineer spec.",
    materialList: "Rebar, #4 grade 60, 40 pieces, 20ft lengths.",
    notes: "Awaiting third quote from North Front Street before deciding.",
    responses: [
      {
        vendorId: "VEN-000007",
        quotedPrice: 860,
        leadTimeDays: 10,
        freight: 60,
        tax: 68.8,
        warranty: "Mill certification included",
        notes: "Can bundle with the next concrete pour delivery.",
        validityPeriodDays: 21,
        submittedDate: "2026-07-13",
      },
      {
        vendorId: "VEN-000009",
        quotedPrice: 910,
        leadTimeDays: 3,
        freight: 0,
        tax: 72.8,
        warranty: "None stated",
        notes: "Rental yard also stocks rebar, fast turnaround.",
        validityPeriodDays: 7,
        submittedDate: "2026-07-12",
      },
    ],
  }),
  rfq({
    id: "RFQ-000003",
    createdBy: "system", createdDate: "2026-07-05T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-05T00:00:00.000Z",
    revisionNumber: 1, module: "Procurement", status: "active",
    projectId: "PRJ-000004",
    rfqNumber: "RFQ-2026-0003",
    materialRequestId: "MR-000002",
    vendorIds: ["VEN-000005"],
    issueDate: "2026-07-05",
    dueDate: "2026-07-12",
    scope: "HVAC filter replacements per MR-2026-0002.",
    materialList: "HVAC filters, 20x25x1, 6 each.",
    notes: "Single-source — Columbia Plumbing & HVAC is the only stocked vendor for this filter size.",
    responses: [],
  }),
  rfq({
    id: "RFQ-000004",
    createdBy: "system", createdDate: "2026-07-13T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-07-13T00:00:00.000Z",
    revisionNumber: 1, module: "Procurement", status: "active",
    projectId: "PRJ-000002",
    rfqNumber: "RFQ-2026-0004",
    materialRequestId: "MR-000004",
    vendorIds: ["VEN-000002", "VEN-000006"],
    issueDate: "2026-07-13",
    dueDate: "2026-07-27",
    scope: "Roof underlayment per MR-2026-0004.",
    materialList: "Synthetic roof underlayment, 15 rolls, 4 sq each.",
    notes: "Waiting on both vendors to respond.",
    responses: [
      {
        vendorId: "VEN-000002",
        quotedPrice: 675,
        leadTimeDays: 7,
        freight: 25,
        tax: 54,
        warranty: "10 year manufacturer warranty",
        notes: "Preferred roofing supplier, matches existing underlayment brand.",
        validityPeriodDays: 30,
        submittedDate: "2026-07-14",
      },
    ],
  }),
];
