import type { USHoliday } from "@/types/references";

/** Real 2026 US federal holiday dates — used for pay period / overtime awareness, not auto-enforced anywhere yet. */
export const MOCK_US_HOLIDAYS: USHoliday[] = [
  { id: "HOL-000001", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", name: "New Year's Day", date: "2026-01-01" },
  { id: "HOL-000002", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", name: "Memorial Day", date: "2026-05-25" },
  { id: "HOL-000003", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", name: "Juneteenth", date: "2026-06-19" },
  { id: "HOL-000004", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", name: "Independence Day", date: "2026-07-04" },
  { id: "HOL-000005", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", name: "Labor Day", date: "2026-09-07" },
  { id: "HOL-000006", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", name: "Thanksgiving Day", date: "2026-11-26" },
  { id: "HOL-000007", createdBy: "system", createdDate: "2026-01-01T00:00:00.000Z", lastModifiedBy: "system", lastModifiedDate: "2026-01-01T00:00:00.000Z", revisionNumber: 1, module: "References", status: "active", name: "Christmas Day", date: "2026-12-25" },
];
