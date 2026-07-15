import type { CostCode } from "@/types/estimating";

/**
 * Cost Code library (CSI MasterFormat-style), scoped to the trades that
 * actually show up in your real schedule and vendor data — siding,
 * windows, roofing, masonry, framing/decking, trim, painting, fencing,
 * plus the mechanical/electrical trades your subcontractors cover.
 * These codes are the shared reference used by Takeoff, Estimates, and
 * Purchase Order line items.
 */
export const MOCK_COST_CODES: CostCode[] = [
  {
    id: "CC-000001", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "032000", description: "Concrete Reinforcing (Rebar)", division: "Division 03 — Concrete", trade: "Concrete",
  },
  {
    id: "CC-000002", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "033000", description: "Cast-In-Place Concrete", division: "Division 03 — Concrete", trade: "Concrete",
  },
  {
    id: "CC-000003", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "042000", description: "Unit Masonry", division: "Division 04 — Masonry", trade: "Masonry",
  },
  {
    id: "CC-000004", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "061000", description: "Rough Carpentry (Framing & Decking)", division: "Division 06 — Wood & Plastics", trade: "Carpentry",
  },
  {
    id: "CC-000005", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "062000", description: "Finish Carpentry (Trim, Fascia & Soffit)", division: "Division 06 — Wood & Plastics", trade: "Carpentry",
  },
  {
    id: "CC-000006", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "074600", description: "Siding", division: "Division 07 — Thermal & Moisture Protection", trade: "Siding",
  },
  {
    id: "CC-000007", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "075400", description: "Roofing Membrane & Shingles", division: "Division 07 — Thermal & Moisture Protection", trade: "Roofing",
  },
  {
    id: "CC-000008", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "076200", description: "Sheet Metal Flashing & Underlayment", division: "Division 07 — Thermal & Moisture Protection", trade: "Roofing",
  },
  {
    id: "CC-000009", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "081000", description: "Doors", division: "Division 08 — Openings", trade: "Doors & Windows",
  },
  {
    id: "CC-000010", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "085000", description: "Windows", division: "Division 08 — Openings", trade: "Doors & Windows",
  },
  {
    id: "CC-000011", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "099000", description: "Painting & Coating", division: "Division 09 — Finishes", trade: "Painting",
  },
  {
    id: "CC-000012", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "220000", description: "Plumbing", division: "Division 22 — Plumbing", trade: "Plumbing",
  },
  {
    id: "CC-000013", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "230000", description: "HVAC", division: "Division 23 — HVAC", trade: "HVAC",
  },
  {
    id: "CC-000014", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "260000", description: "Electrical", division: "Division 26 — Electrical", trade: "Electrical",
  },
  {
    id: "CC-000015", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z",
    lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z",
    revisionNumber: 1, module: "Estimating", status: "active",
    code: "321000", description: "Fencing & Site Improvements", division: "Division 32 — Exterior Improvements", trade: "General",
  },
];
